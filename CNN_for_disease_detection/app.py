"""
CropSage AI Server
==================
POST /predict        — Plant disease detection via CNN
POST /recommend-crop — Crop recommendation via sklearn pipeline
GET  /health         — Liveness + readiness check
GET  /warmup         — Trigger model load before real traffic (call after deploy)
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
logger = logging.getLogger("cropsage")

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "trained_plant_disease_model.keras")
PKL_PATH   = os.path.join(BASE_DIR, "crop_pipeline_model.pkl")

# ---------------------------------------------------------------------------
# Lazy model loading — TF is imported only when first request arrives.
# This prevents Gunicorn master from OOMing before it can bind the port.
# ---------------------------------------------------------------------------
_lock          = threading.Lock()
_disease_model = None   # set after first successful load
_crop_model    = None
_load_error    = None   # non-None string means loading failed permanently


def _ensure_models_loaded():
    """Load models on first call; subsequent calls are near-zero cost."""
    global _disease_model, _crop_model, _load_error

    if _disease_model is not None or _load_error is not None:
        return  # fast path

    with _lock:
        if _disease_model is not None or _load_error is not None:
            return  # another thread beat us to it

        try:
            if not os.path.isfile(MODEL_PATH):
                raise FileNotFoundError(
                    f"CNN model not found at: {MODEL_PATH}\n"
                    "Make sure trained_plant_disease_model.keras is committed to the repo."
                )
            if not os.path.isfile(PKL_PATH):
                raise FileNotFoundError(
                    f"Pickle model not found at: {PKL_PATH}\n"
                    "Make sure crop_pipeline_model.pkl is committed to the repo."
                )

            logger.info("Importing TensorFlow (slow on first call) ...")
            # Deferred import — keeps module-level import fast so Gunicorn can start
            import tensorflow as tf  # noqa: F401 — used below for load_model
            logger.info("TensorFlow imported, loading CNN model ...")
            _disease_model = tf.keras.models.load_model(MODEL_PATH)
            logger.info("CNN model loaded OK")

            logger.info("Loading crop pipeline ...")
            with open(PKL_PATH, "rb") as fh:
                _crop_model = pickle.load(fh)
            logger.info("Crop pipeline loaded OK")

        except Exception as exc:
            _load_error = str(exc)
            logger.critical(
                "Model loading FAILED: %s\n%s", exc, traceback.format_exc()
            )


# ---------------------------------------------------------------------------
# Image preprocessing
# ---------------------------------------------------------------------------
MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB

def _preprocess_image(file_storage) -> np.ndarray:
    """
    Convert an uploaded image to a (1, 128, 128, 3) float32 array.

    *** DO NOT divide by 255 ***
    The model was trained with tf.keras.utils.image_dataset_from_directory
    which feeds raw [0-255] pixel values.  Normalising to [0-1] causes
    near-zero activations — the model will always output the same class.

    We intentionally avoid keras.preprocessing.image.img_to_array here:
    that function was moved/deprecated across TF versions and is just a
    thin wrapper around numpy anyway.
    """
    raw = file_storage.read()
    if not raw:
        raise ValueError("Empty upload — no bytes received")
    if len(raw) > MAX_IMAGE_BYTES:
        raise ValueError(
            f"Image too large ({len(raw) // 1024} KB). Maximum is 10 MB."
        )

    try:
        img = Image.open(io.BytesIO(raw))
    except Exception as exc:
        raise ValueError(f"Cannot decode image: {exc}") from exc

    img = ImageOps.exif_transpose(img)  # fix phone rotation
    img = img.convert("RGB")

    try:
        resample = Image.Resampling.LANCZOS
    except AttributeError:          # Pillow < 9.1
        resample = Image.LANCZOS    # type: ignore[attr-defined]

    img = img.resize((128, 128), resample)

    # Pure numpy — no TF dependency for this step
    arr = np.array(img, dtype=np.float32)   # shape (128, 128, 3), values [0-255]
    arr = np.expand_dims(arr, axis=0)       # shape (1, 128, 128, 3)
    return arr


# ---------------------------------------------------------------------------
# Class labels
# ---------------------------------------------------------------------------
CLASS_NAMES = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust",
    "Apple___healthy", "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot", "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot", "Peach___healthy",
    "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy",
    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
    "Raspberry___healthy", "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch", "Strawberry___healthy",
    "Tomato___Bacterial_spot", "Tomato___Early_blight",
    "Tomato___Late_blight", "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "ok", "service": "CropSage AI Server"})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":               "ok",
        "disease_model_loaded": _disease_model is not None,
        "crop_model_loaded":    _crop_model is not None,
        "load_error":           _load_error,
    })


@app.route("/warmup", methods=["GET", "POST"])
def warmup():
    """
    Trigger model loading without a real prediction.
    Call this endpoint once after every deploy to pre-warm the instance:
        curl https://cropsage-ai-models.onrender.com/warmup
    """
    logger.info("/warmup called — loading models ...")
    _ensure_models_loaded()

    if _load_error:
        return jsonify({"status": "error", "detail": _load_error}), 500

    return jsonify({"status": "ready", "message": "Models loaded successfully"})


@app.route("/predict", methods=["POST"])
def predict():
    logger.info("POST /predict | content-type: %s", request.content_type)

    _ensure_models_loaded()

    if _load_error:
        logger.error("Returning 503 — model load error: %s", _load_error)
        return jsonify({
            "error":  "AI model failed to load",
            "detail": _load_error,
        }), 503

    if _disease_model is None:
        return jsonify({
            "error": "Model not ready — loading may still be in progress, retry in 10 s",
        }), 503

    # Validate uploaded file
    file = request.files.get("image")
    if file is None:
        available = list(request.files.keys())
        logger.warning("No 'image' field. Available: %s", available)
        return jsonify({
            "error":  "No image uploaded",
            "detail": f"Expected multipart field 'image'. Got: {available}",
        }), 400

    # Preprocess
    try:
        batch = _preprocess_image(file)
    except ValueError as exc:
        logger.warning("Preprocessing failed: %s", exc)
        return jsonify({"error": str(exc)}), 400
    except Exception:
        logger.exception("Unexpected preprocessing error")
        return jsonify({"error": "Image processing error"}), 500

    # Inference
    try:
        logger.info("Running model.predict ...")
        preds = _disease_model.predict(batch, verbose=0)
        logger.info("Inference complete")
    except Exception:
        logger.exception("Inference error")
        return jsonify({"error": "Model inference failed"}), 500

    # Parse output
    probs = np.asarray(preds[0], dtype=np.float64).reshape(-1)

    if probs.size != len(CLASS_NAMES):
        logger.error("Output size %d != class list %d", probs.size, len(CLASS_NAMES))
        return jsonify({
            "error": f"Model output {probs.size} != class list {len(CLASS_NAMES)}",
        }), 500

    top_idx        = np.argsort(probs)[::-1][:3]
    result_index   = int(top_idx[0])
    confidence     = float(probs[result_index])

    top_predictions = [
        {"disease": CLASS_NAMES[i], "confidence": round(float(probs[i]) * 100, 2)}
        for i in top_idx
    ]

    logger.info(
        "Prediction: %s  confidence: %.1f%%",
        CLASS_NAMES[result_index], confidence * 100,
    )

    return jsonify({
        "disease":         CLASS_NAMES[result_index],
        "confidence":      round(confidence * 100, 2),
        "top_predictions": top_predictions,
    })


@app.route("/recommend-crop", methods=["POST"])
def recommend_crop():
    logger.info("POST /recommend-crop")

    _ensure_models_loaded()

    if _load_error:
        return jsonify({"error": "Model failed to load", "detail": _load_error}), 503
    if _crop_model is None:
        return jsonify({"error": "Crop model not ready — retry in 10 s"}), 503

    try:
        if request.is_json:
            data = request.get_json(force=True)
            def get(k): return data[k]
        else:
            def get(k): return request.form[k]

        N           = int(float(get("Nitrogen")))
        P           = int(float(get("Phosphorus")))
        K           = int(float(get("Potassium")))
        temperature = float(get("Temperature"))
        humidity    = float(get("Humidity"))
        ph          = float(get("pH"))
        rainfall    = float(get("Rainfall"))

    except (KeyError, ValueError, TypeError) as exc:
        logger.warning("Bad input to /recommend-crop: %s", exc)
        return jsonify({"error": "Invalid input", "detail": str(exc)}), 400

    features = np.array(
        [N, P, K, temperature, humidity, ph, rainfall], dtype=np.float64
    ).reshape(1, -1)

    try:
        prediction = _crop_model.predict(features)
    except Exception:
        logger.exception("Crop model predict error")
        return jsonify({"error": "Crop prediction error"}), 500

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
# Dev entry point — Render uses gunicorn via gunicorn.conf.py
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
