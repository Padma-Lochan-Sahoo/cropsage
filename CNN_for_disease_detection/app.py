"""
CropSage AI Server — Flask application

Deployment notes for Render:
- TensorFlow is large (~300-600 MB). To avoid OOM on startup we load the model
  LAZILY on the first request rather than at module import time.
- preload_app is set to False in gunicorn.conf.py for the same reason.
- The /health endpoint reports whether models are loaded yet.
- A /warmup endpoint can be called after deploy to trigger loading before real traffic.
"""

import io
import logging
import os
import pickle
import threading
import traceback

import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image, ImageOps

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("cropsage-ai")

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ---------------------------------------------------------------------------
# Model paths
# ---------------------------------------------------------------------------
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "trained_plant_disease_model.keras")
PKL_PATH   = os.path.join(BASE_DIR, "crop_pipeline_model.pkl")

# ---------------------------------------------------------------------------
# Lazy model state — loaded on first use, protected by a lock
# ---------------------------------------------------------------------------
_model_lock    = threading.Lock()
_disease_model = None   # tf.keras model
_crop_model    = None   # sklearn pipeline
_load_error    = None   # string if loading failed

def _load_models():
    """Import TensorFlow and load both models. Called lazily on first request."""
    global _disease_model, _crop_model, _load_error

    with _model_lock:
        # Double-checked locking: another thread may have loaded while we waited
        if _disease_model is not None or _load_error is not None:
            return

        try:
            logger.info("Importing TensorFlow (this is slow on first call) ...")
            import tensorflow as tf  # deferred import — keeps gunicorn startup fast
            from tensorflow.keras.preprocessing import image as keras_image_module
            # Store the sub-module reference so _prepare_image can use it
            app.config["keras_image"] = keras_image_module

            if not os.path.isfile(MODEL_PATH):
                raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
            if not os.path.isfile(PKL_PATH):
                raise FileNotFoundError(f"Pickle file not found: {PKL_PATH}")

            logger.info("Loading CNN model from %s ...", MODEL_PATH)
            _disease_model = tf.keras.models.load_model(MODEL_PATH)
            logger.info("CNN model loaded OK")

            logger.info("Loading crop pipeline from %s ...", PKL_PATH)
            with open(PKL_PATH, "rb") as fh:
                _crop_model = pickle.load(fh)
            logger.info("Crop pipeline loaded OK")

        except Exception as exc:
            _load_error = str(exc)
            logger.critical("Model loading failed: %s\n%s", exc, traceback.format_exc())

# ---------------------------------------------------------------------------
# Class labels
# ---------------------------------------------------------------------------
CLASS_NAMES = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust",
    "Apple___healthy", "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_", "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy", "Grape___Black_rot", "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)", "Peach___Bacterial_spot",
    "Peach___healthy", "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy",
    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
    "Raspberry___healthy", "Soybean___healthy", "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch", "Strawberry___healthy",
    "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight",
    "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite", "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]

MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB


def _prepare_image(file_storage) -> np.ndarray:
    """
    Preprocess uploaded image to match the training pipeline exactly.

    IMPORTANT — do NOT normalise to [0-1].
    The model was trained with image_dataset_from_directory which feeds
    raw [0-255] pixel values directly to the network.  Dividing by 255
    sends near-zero inputs to the model and forces it to always predict
    the same dominant class.
    """
    raw = file_storage.read()
    if not raw:
        raise ValueError("Empty image upload — no bytes received")
    if len(raw) > MAX_IMAGE_BYTES:
        raise ValueError(f"Image too large ({len(raw) // 1024} KB); max 10 MB")

    try:
        img = Image.open(io.BytesIO(raw))
    except Exception as exc:
        raise ValueError(f"Cannot open image: {exc}") from exc

    img = ImageOps.exif_transpose(img)   # fix phone EXIF rotation
    img = img.convert("RGB")

    try:
        resample = Image.Resampling.LANCZOS
    except AttributeError:
        resample = Image.LANCZOS

    img = img.resize((128, 128), resample)

    keras_image = app.config["keras_image"]
    arr = keras_image.img_to_array(img)   # float32 in [0, 255]
    arr = np.expand_dims(arr, axis=0)     # (1, 128, 128, 3)
    return arr


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "ok", "service": "CropSage AI Server"})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":                "ok",
        "disease_model_loaded":  _disease_model is not None,
        "crop_model_loaded":     _crop_model is not None,
        "load_error":            _load_error,
    })


@app.route("/warmup", methods=["GET", "POST"])
def warmup():
    """
    Call this endpoint right after deploy to trigger model loading
    before real traffic arrives.  Returns 200 once models are ready.
    """
    logger.info("Warmup requested — loading models ...")
    _load_models()
    if _load_error:
        return jsonify({"status": "error", "detail": _load_error}), 500
    return jsonify({
        "status":  "ready",
        "message": "Models loaded and ready",
    })


@app.route("/predict", methods=["POST"])
def predict():
    logger.info("POST /predict — content-type: %s", request.content_type)

    # Ensure models are loaded (lazy, thread-safe)
    _load_models()

    if _load_error:
        logger.error("Model load error: %s", _load_error)
        return jsonify({
            "error":  "AI model failed to load at startup",
            "detail": _load_error,
        }), 503

    if _disease_model is None:
        return jsonify({"error": "Disease model not yet loaded — try again in a moment"}), 503

    # Validate file
    file = request.files.get("image")
    if file is None:
        logger.warning(
            "No 'image' field. Available fields: %s", list(request.files.keys())
        )
        return jsonify({
            "error":  "No image uploaded",
            "detail": (
                f"Expected multipart field 'image'. "
                f"Received: {list(request.files.keys())}"
            ),
        }), 400

    # Preprocess
    try:
        batch = _prepare_image(file)
    except ValueError as exc:
        logger.warning("Image prep failed: %s", exc)
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        logger.error("Image prep unexpected error: %s", traceback.format_exc())
        return jsonify({"error": "Image processing error", "detail": str(exc)}), 500

    # Inference
    try:
        logger.info("Running inference ...")
        predictions = _disease_model.predict(batch, verbose=0)
        logger.info("Inference complete")
    except Exception as exc:
        logger.error("Inference error: %s", traceback.format_exc())
        return jsonify({"error": "Model inference failed", "detail": str(exc)}), 500

    # Build response
    probs = np.asarray(predictions[0], dtype=np.float64).reshape(-1)

    if probs.size != len(CLASS_NAMES):
        logger.error("Size mismatch: got %d, expected %d", probs.size, len(CLASS_NAMES))
        return jsonify({
            "error": f"Model output {probs.size} != class list {len(CLASS_NAMES)}",
        }), 500

    result_index = int(np.argmax(probs))
    confidence   = float(np.max(probs))
    top_indices  = np.argsort(probs)[::-1][:3]

    top_predictions = [
        {"disease": CLASS_NAMES[i], "confidence": round(float(probs[i]) * 100, 2)}
        for i in top_indices
    ]

    logger.info("Prediction: %s (%.1f%%)", CLASS_NAMES[result_index], confidence * 100)

    return jsonify({
        "disease":         CLASS_NAMES[result_index],
        "confidence":      round(confidence * 100, 2),
        "top_predictions": top_predictions,
    })


@app.route("/recommend-crop", methods=["POST"])
def recommend_crop():
    logger.info("POST /recommend-crop")

    _load_models()

    if _load_error:
        return jsonify({"error": "Model failed to load", "detail": _load_error}), 503

    if _crop_model is None:
        return jsonify({"error": "Crop model not yet loaded — try again shortly"}), 503

    try:
        if request.is_json:
            data = request.get_json(force=True)
            def get(k): return data[k]
        else:
            def get(k): return request.form[k]

        N           = int(get("Nitrogen"))
        P           = int(get("Phosphorus"))
        K           = int(get("Potassium"))
        temperature = float(get("Temperature"))
        humidity    = float(get("Humidity"))
        ph          = float(get("pH"))
        rainfall    = float(get("Rainfall"))

    except (KeyError, ValueError, TypeError) as exc:
        logger.warning("Bad input: %s", exc)
        return jsonify({"error": "Invalid input", "detail": str(exc)}), 400

    features = np.array([N, P, K, temperature, humidity, ph, rainfall]).reshape(1, -1)

    try:
        prediction = _crop_model.predict(features)
    except Exception as exc:
        logger.error("Crop predict error: %s", exc)
        return jsonify({"error": "Prediction error", "detail": str(exc)}), 500

    crop_dict = {
        1: "rice", 2: "maize", 3: "jute", 4: "cotton", 5: "coconut",
        6: "papaya", 7: "orange", 8: "apple", 9: "muskmelon", 10: "watermelon",
        11: "grapes", 12: "mango", 13: "banana", 14: "pomegranate", 15: "lentil",
        16: "blackgram", 17: "mungbean", 18: "mothbeans", 19: "pigeonpeas",
        20: "kidneybeans", 21: "chickpea", 22: "coffee",
    }

    label  = prediction[0]
    crop   = crop_dict.get(label)
    result = (
        f"{crop} is the best crop to be cultivated"
        if crop
        else "Sorry, we cannot recommend a crop for this environment"
    )

    logger.info("Crop recommendation: %s", result)
    return jsonify({"result": result, "crop": crop})


# ---------------------------------------------------------------------------
# Dev entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
