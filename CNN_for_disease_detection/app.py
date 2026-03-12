from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import pickle

app = Flask(__name__)

# Load model ONCE
model = tf.keras.models.load_model(
    "trained_plant_disease_model.keras"
)
crop_recommendation_model = pickle.load(open('crop_pipeline_model.pkl', 'rb'))

class_name = ['Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
                  'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew',
                  'Cherry_(including_sour)___healthy', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
                  'Corn_(maize)___Common_rust_', 'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy',
                  'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
                  'Grape___healthy', 'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot',
                  'Peach___healthy', 'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy',
                  'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
                  'Raspberry___healthy', 'Soybean___healthy', 'Squash___Powdery_mildew',
                  'Strawberry___Leaf_scorch', 'Strawberry___healthy', 'Tomato___Bacterial_spot',
                  'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold',
                  'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite',
                  'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus',
                  'Tomato___healthy']

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    file = request.files["image"]

    image = Image.open(file)
    image = image.resize((128, 128))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)

    predictions = model.predict(image)

    result_index = np.argmax(predictions)
    confidence = float(np.max(predictions))

    return jsonify({
        "disease": class_name[result_index],
        "confidence": round(confidence * 100, 2)
    })

@app.route("/recommend-crop", methods=["POST"])
def recommend_crop():
    N = int(request.form['Nitrogen'])
    P = int(request.form['Phosphorus'])
    K = int(request.form['Potassium'])
    temperature = float(request.form['Temperature'])
    humidity = float(request.form['Humidity'])
    ph = float(request.form['pH'])
    rainfall = float(request.form['Rainfall'])
    features_list = [N,P,K,temperature,humidity,ph,rainfall]
    single_pred = np.array(features_list).reshape(1,-1)
    prediction = crop_recommendation_model.predict(single_pred)


    crop_dict = {
    1: 'rice',2: 'maize',3: 'jute',4: 'cotton',5: 'coconut',6: 'papaya',7: 'orange',
    8: 'apple',9: 'muskmelon',10: 'watermelon',11: 'grapes',12: 'mango',13: 'banana',
    14: 'pomegranate',15: 'lentil',16: 'blackgram',17: 'mungbean',18: 'mothbeans',
    19: 'pigeonpeas',20: 'kidneybeans',21: 'chickpea',22: 'coffee'
    }

    if prediction[0] in crop_dict:
        crop = crop_dict[prediction[0]]
        result = f"{crop} is a best crop to be cultivated"
    else:
        result = "Sorry we are not able to recommond a proper crop in this enviroment"
    
    return jsonify({
        "result": result
    })

if __name__ == "__main__":
    app.run(debug=True)