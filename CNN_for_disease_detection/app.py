"""
CropSage AI Server
==================
Models are loaded ONCE at startup inside the application factory.
This is simpler, safer and avoids all the threading/lazy-load bugs.

Gunicorn is configured with:
  - workers=1      (only 1 worker so model loads once, not per-worker)
  - preload_app=False  (gunicorn forks AFTER app is imported; with 1 worker
                        this is fine and avoids master-process OOM)
  - timeout=300    (5 min — covers TF import + model load on cold Render instance)
"""

import io
import logging
import os
import pickle
import traceback

import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image, ImageOps

# ── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("cropsage")

# ── App ────────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ── Model paths ────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "trained_plant_disease_model.keras")
PKL_PATH   = os.path.join(BASE_DIR, "crop_pipeline_model.pkl")

# ── Load models at module import time ─────────────────────────────────────
# With gunicorn workers=1 this runs exactly once per dyno restart.
# We import TensorFlow here so any import error surfaces immediately in logs.

logger.info("=== CropSage AI Server starting ===")
logger.info("BASE_DIR : %s", BASE_DIR)
logger.info("MODEL_PATH exists: %s", os.path.isfile(MODEL_PATH))
logger.info("PKL_PATH   exists: %s", os.path.isfile(PKL_PATH))

disease_model = None
crop_model    = None
startup_error = None   # set if loading fails; returned in /health

try:
    logger.info("Importing TensorFlow ...")
    import tensorflow as tf
    logger.info("TensorFlow version: %s", tf.__version__)

    logger.info("Loading CNN model from %s ...", MODEL_PATH)
    disease_model = tf.keras.models.load_model(MODEL_PATH)
    logger.info("CNN model loaded OK — output shape: %s", disease_model.output_shape)

    logger.info("Loading crop pipeline from %s ...", PKL_PATH)
    with open(PKL_PATH, "rb") as fh:
        crop_model = pickle.load(fh)
    logger.info("Crop pipeline loaded OK — type: %s", type(crop_model).__name__)

    logger.info("=== All models ready ===")

except Exception as exc:
    startup_error = str(exc)
    logger.critical(
        "STARTUP FAILED — models did not load:\n%s\n%s",
        exc,
        traceback.format_exc(),
    )
    # We do NOT exit — we let the app start so /health returns a useful error message
    # rather than Render showing a generic 502.

# ── Class labels ──────────────────────────────────────────────────────────
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

MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB


# ── Image preprocessing ───────────────────────────────────────────────────
def _preprocess_image(file_storage) -> np.ndarray:
    """
    Return a (1, 128, 128, 3) float32 array with pixel values in [0, 255].

    DO NOT normalise to [0-1] — the model was trained on raw [0-255] values.
    Normalising causes near-zero activations and breaks predictions.
    """
    raw = file_storage.read()
    if not raw:
        raise ValueError("Empty upload — no bytes received")
    if len(raw) > MAX_IMAGE_BYTES:
        raise ValueError(f"Image too large ({len(raw) // 1024} KB). Max 10 MB.")

    try:
        img = Image.open(io.BytesIO(raw))
    except Exception as exc:
        raise ValueError(f"Cannot decode image: {exc}") from exc

    img = ImageOps.exif_transpose(img)  # fix phone EXIF rotation
    img = img.convert("RGB")

    try:
        resample = Image.Resampling.LANCZOS
    except AttributeError:
        resample = Image.LANCZOS  # type: ignore[attr-defined]

    img  = img.resize((128, 128), resample)
    arr  = np.array(img, dtype=np.float32)   # (128, 128, 3) — pure numpy, no TF dep
    arr  = np.expand_dims(arr, axis=0)       # (1, 128, 128, 3)
    return arr


# ── Routes ────────────────────────────────────────────────────────────────

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "ok", "service": "CropSage AI Server"})


@app.route("/health", methods=["GET"])
def health():
    """
    Call this to verify models loaded correctly after deploy:
        curl https://cropsage-ai-models.onrender.com/health
    Expect: {"disease_model_loaded": true, "crop_model_loaded": true}
    """
    return jsonify({
        "status":               "ok" if (disease_model and crop_model) else "degraded",
        "disease_model_loaded": disease_model is not None,
        "crop_model_loaded":    crop_model is not None,
        "startup_error":        startup_error,
    })


@app.route("/predict", methods=["POST"])
def predict():
    logger.info("POST /predict | content-type: %s", request.content_type)

    if disease_model is None:
        logger.error("disease_model is None — startup_error: %s", startup_error)
        return jsonify({
            "error":  "Disease model not loaded",
            "detail": startup_error or "Unknown startup error. Check Render logs.",
        }), 503

    # Validate uploaded file
    file = request.files.get("image")
    if file is None:
        logger.warning("No 'image' field. Fields received: %s", list(request.files.keys()))
        return jsonify({
            "error":  "No image uploaded",
            "detail": f"Expected multipart field 'image'. Got: {list(request.files.keys())}",
        }), 400

    # Preprocess
    try:
        batch = _preprocess_image(file)
    except ValueError as exc:
        logger.warning("Preprocessing error: %s", exc)
        return jsonify({"error": str(exc)}), 400
    except Exception:
        logger.exception("Unexpected preprocessing error")
        return jsonify({"error": "Image processing error"}), 500

    # Inference
    try:
        logger.info("Running model.predict ...")
        preds = disease_model.predict(batch, verbose=0)
        logger.info("Inference complete")
    except Exception:
        logger.exception("Inference error")
        return jsonify({"error": "Model inference failed"}), 500

    # Parse output
    probs = np.asarray(preds[0], dtype=np.float64).reshape(-1)

    if probs.size != len(CLASS_NAMES):
        logger.error("Output size %d != CLASS_NAMES %d", probs.size, len(CLASS_NAMES))
        return jsonify({
            "error": f"Model output size {probs.size} does not match class list {len(CLASS_NAMES)}",
        }), 500

    top_idx      = np.argsort(probs)[::-1][:3]
    result_index = int(top_idx[0])
    confidence   = float(probs[result_index])

    top_predictions = [
        {"disease": CLASS_NAMES[i], "confidence": round(float(probs[i]) * 100, 2)}
        for i in top_idx
    ]

    logger.info("Prediction: %s (%.1f%%)", CLASS_NAMES[result_index], confidence * 100)

    return jsonify({
        "disease":         CLASS_NAMES[result_index],
        "confidence":      round(confidence * 100, 2),
        "top_predictions": top_predictions,
    })


@app.route("/recommend-crop", methods=["POST"])
def recommend_crop():
    logger.info("POST /recommend-crop | content-type: %s", request.content_type)

    if crop_model is None:
        logger.error("crop_model is None — startup_error: %s", startup_error)
        return jsonify({
            "error":  "Crop model not loaded",
            "detail": startup_error or "Unknown startup error. Check Render logs.",
        }), 503

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
        logger.warning("Bad input: %s", exc)
        return jsonify({"error": "Invalid input", "detail": str(exc)}), 400

    features = np.array(
        [N, P, K, temperature, humidity, ph, rainfall], dtype=np.float64
    ).reshape(1, -1)

    try:
        prediction = crop_model.predict(features)
    except Exception:
        logger.exception("Crop predict error")
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


# ── Dev entry point ───────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
