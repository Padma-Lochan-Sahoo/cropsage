# 🌾 CropSage — AI-Powered Smart Farming Platform

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://cropsage-zeta.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://cropsage-backend.onrender.com)
[![AI Server](https://img.shields.io/badge/AI%20Server-Render-46E3B7?logo=render)](https://cropsage-ai-models.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

CropSage is a full-stack AI-powered precision agriculture platform that helps farmers make data-driven decisions. It combines a Convolutional Neural Network (CNN) for plant disease detection with ML-based crop recommendations, real-time weather data, and an AI farming assistant — all in one browser app available in English, Hindi, and Odia.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Local Setup](#-local-setup)
- [Environment Variables](#-environment-variables)
- [Deployment Guide](#-deployment-guide)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Troubleshooting](#-troubleshooting)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌱 Project Overview

CropSage addresses a core challenge for smallholder farmers: accessing expert agricultural knowledge in real time. By combining a CNN trained on 38 plant disease classes, a scikit-learn crop recommendation model, real-time weather data, and GPT-4o-mini generated treatment plans, CropSage provides actionable guidance directly in the farmer's browser.

**Live URLs**

| Service | URL |
|---------|-----|
| Frontend | https://cropsage-zeta.vercel.app |
| Backend API | https://cropsage-backend.onrender.com |
| Flask AI Server | https://cropsage-ai-models.onrender.com |

---

## 🏗 Architecture

```
┌─────────────────────────────────────┐
│           Browser (React)           │
│  Vite · Tailwind · i18n (3 langs)  │
└──────────────┬──────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────┐
│       Express Backend (Node.js)     │
│  Auth · Disease · Crop · Weather    │
│  Chat · Fertilizer · Profile        │
└──────────┬──────────────────────────┘
           │ Internal HTTP (multipart/form-data & JSON)
           ▼
┌─────────────────────────────────────┐
│        Flask AI Server (Python)     │
│  CNN Disease Detection              │
│  Scikit-learn Crop Recommendation  │
└──────────────────────────────────────┘
           │
           ▼ Model files bundled at deploy time
  trained_plant_disease_model.keras
  crop_pipeline_model.pkl
```

**Request lifecycle — Plant Disease Detection**

```
1. User picks a leaf image in the browser
2. Frontend sends POST /api/disease/predict  (multipart/form-data, field="image")
3. Express validates the file and forwards the buffer to Flask /predict
   └── formData.append("image", buffer, { filename, contentType })  ← critical
4. Flask: EXIF-fix → RGB → resize 128×128 → float32 [0-255] array
5. CNN model runs inference → top-3 class probabilities
6. Express enriches the result via OpenAI GPT-4o-mini (treatment advice)
7. JSON response sent back to the browser
```

---

## ✨ Features

- **Plant Disease Detection** — Upload a leaf photo; CNN identifies the disease from 38 classes with confidence score and top-3 alternatives
- **AI Treatment Plans** — GPT-4o-mini generates organic treatment, chemical treatment, and preventive measures per detected disease
- **Crop Recommendation** — Enter soil NPK + climate data; ML model recommends the optimal crop
- **Fertilizer Recommendation** — Personalised fertilizer guidance with AI cultivation notes
- **Weather Advisory** — Real-time 5-day forecast with crop-specific weather risk alerts
- **AI Farming Assistant** — Conversational AI chat for general agricultural queries
- **Multi-language UI** — English, Hindi (हिंदी), Odia (ଓଡ଼ିଆ)
- **Google OAuth + JWT** — Secure authentication with session persistence

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Axios, i18next |
| Backend | Node.js, Express 4, Mongoose, Multer, JWT, Passport.js |
| AI Server | Python 3.11, Flask 3, TensorFlow 2.17, scikit-learn 1.4, Pillow, Gunicorn |
| Database | MongoDB Atlas |
| AI/LLM | OpenAI GPT-4o-mini |
| Weather | OpenWeatherMap API |
| Deployment | Vercel (frontend), Render (backend + AI server) |

---

## 📂 Folder Structure

```
cropsage/
├── frontend/                           # React + Vite app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DiseaseDetection.jsx   # Plant disease UI
│   │   │   ├── FertilizerRecommendation.jsx
│   │   │   ├── WeatherAdvisory.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── components/                # Navbar, Sidebar, etc.
│   │   ├── context/AuthContext.jsx    # JWT auth state
│   │   ├── locales/                   # en / hi / or translations
│   │   └── App.jsx
│   ├── .env.sample
│   └── vite.config.js
│
├── backend/                            # Express API
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── diseaseController.js   # Image proxy → Flask + OpenAI
│   │   │   ├── fertilizerController.js
│   │   │   ├── chatController.js
│   │   │   ├── weatherController.js
│   │   │   └── authController.js
│   │   ├── routes/
│   │   ├── models/                    # Mongoose schemas
│   │   ├── middleware/auth.js         # JWT guard
│   │   └── config/db.js
│   ├── .env.sample
│   └── app.js
│
└── CNN_for_disease_detection/          # Flask AI server
    ├── app.py                          # Flask routes + preprocessing
    ├── gunicorn.conf.py                # Production Gunicorn config
    ├── requirements.txt
    ├── runtime.txt                     # python-3.11.9
    ├── trained_plant_disease_model.keras
    └── crop_pipeline_model.pkl
```

---

## 🚀 Local Setup

### Prerequisites

- Node.js ≥ 20
- Python 3.11
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key
- OpenWeatherMap API key
- Google OAuth credentials

### 1. Flask AI Server

```bash
cd CNN_for_disease_detection
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py                  # http://localhost:5000
```

### 2. Express Backend

```bash
cd backend
cp .env.sample .env
# Fill in all values — especially FLASK_SERVER_URL=http://127.0.0.1:5000
npm install
npm run dev                    # http://localhost:5001
```

### 3. React Frontend

```bash
cd frontend
cp .env.sample .env.local
# Set VITE_API_BASE_URL=http://localhost:5001
npm install
npm run dev                    # http://localhost:3000
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Express server port (default 5001) | No |
| `MONGO_URI` | MongoDB Atlas connection string | ✅ |
| `JWT_SECRET` | Secret for signing JWT tokens | ✅ |
| `SESSION_SECRET` | Express session secret | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ✅ |
| `OPENAI_API_KEY` | OpenAI API key | ✅ |
| `OPENAI_CHAT_MODEL` | Model name (default `gpt-4o-mini`) | No |
| `FLASK_SERVER_URL` | **URL of the Flask AI server** | ✅ |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | ✅ |

> ⚠️ **`FLASK_SERVER_URL` is the #1 cause of disease prediction failures in production.** In Render, set it to `https://cropsage-ai-models.onrender.com`. Locally it defaults to `http://127.0.0.1:5000`.

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend URL (e.g. `https://cropsage-backend.onrender.com`) |
| `VITE_FLASK_API_URL` | Flask AI URL |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

---

## ☁️ Deployment Guide

### Flask AI Server on Render

1. Create a new **Web Service** in Render, pointed at your repo
2. **Root Directory**: `CNN_for_disease_detection`
3. **Runtime**: Python
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `gunicorn app:app -c gunicorn.conf.py`
6. **Instance Type**: Standard or higher (the CNN model requires ≥ 512 MB RAM; Starter will OOM and show a 503)
7. No environment variables are needed for the Flask server itself

> **Cold-start note**: Render free/starter instances spin down after 15 min of inactivity. The first request after a cold start may take 60-120 s while TensorFlow loads the model. The Gunicorn timeout in `gunicorn.conf.py` is set to 180 s to handle this.

### Express Backend on Render

1. Create a new **Web Service**, root directory `backend`
2. **Build Command**: `npm install`
3. **Start Command**: `npm start`
4. Add all environment variables from the table above
5. **Critical**: set `FLASK_SERVER_URL` = `https://cropsage-ai-models.onrender.com`

### React Frontend on Vercel

1. Import the repo into Vercel, set **Root Directory** to `frontend`
2. **Framework Preset**: Vite
3. Add environment variables:
   - `VITE_API_BASE_URL` = your Render backend URL
   - `VITE_GOOGLE_CLIENT_ID` = your Google client ID
4. Deploy

---

## 📖 API Documentation

### Disease Detection

**`POST /api/disease/predict`**

| | |
|---|---|
| Content-Type | `multipart/form-data` |
| Field | `image` (jpg / png / webp, max 10 MB) |

Response `200`:
```json
{
  "disease": "Tomato___Early_blight",
  "confidence": 94.23,
  "top_predictions": [
    { "disease": "Tomato___Early_blight", "confidence": 94.23 },
    { "disease": "Tomato___Late_blight",  "confidence": 3.11 },
    { "disease": "Tomato___Target_Spot",  "confidence": 1.44 }
  ],
  "plant": "Tomato",
  "diseaseName": "Early blight",
  "treatmentAdvice": {
    "short_summary": "...",
    "causes": "...",
    "organic_treatment": ["..."],
    "chemical_treatment": ["..."],
    "preventive_measures": ["..."],
    "notes": "..."
  }
}
```

---

### Crop Recommendation

**`POST /api/fertilizer/recommend`**

Body (JSON):
```json
{
  "Nitrogen": 90, "Phosphorus": 42, "Potassium": 43,
  "Temperature": 20.8, "Humidity": 82.0,
  "pH": 6.5, "Rainfall": 202.9
}
```

Response `200`:
```json
{ "result": "rice is the best crop to be cultivated", "crop": "rice" }
```

---

### Flask Health Check

**`GET /health`** (Flask server)
```json
{
  "status": "ok",
  "disease_model_loaded": true,
  "crop_model_loaded": true
}
```

---

## 📸 Screenshots

> Add screenshots after deployment to `docs/screenshots/`

| Feature | File |
|---------|------|
| Home Page | `docs/screenshots/home.png` |
| Disease Detection | `docs/screenshots/disease.png` |
| Crop Recommendation | `docs/screenshots/crop.png` |
| Weather Advisory | `docs/screenshots/weather.png` |
| AI Chat | `docs/screenshots/chat.png` |

---

## 🔧 Troubleshooting

### Disease prediction fails with 500 after deployment

**Root cause**: `FLASK_SERVER_URL` is not set on the Render backend service, so Express tries to reach `localhost:5000` which does not exist in the cloud.

**Fix**: Render → backend service → Environment → add `FLASK_SERVER_URL=https://cropsage-ai-models.onrender.com` → redeploy.

---

### Other common issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Flask 400 "No image uploaded" | `contentType` missing in `formData.append` | Fixed in `diseaseController.js` — pass `{ filename, contentType }` options |
| Flask 503 on first request | Model failed to load — OOM or missing `.keras` file | Upgrade Render instance to Standard; check that model file is committed |
| Request timeout (30 s) | Gunicorn default timeout too short | Fixed: `timeout = 180` in `gunicorn.conf.py` |
| `numpy` import error on Flask | `numpy==1.24.3` incompatible with TF 2.17 | Fixed: `requirements.txt` uses `numpy>=1.26.0` |
| Disease always predicts same class | Pixel values divided by 255 before inference | Do NOT normalise — model was trained on [0-255] values |
| CORS error in browser | Frontend URL not in Express CORS whitelist | Add your Vercel URL to the `origin` array in `backend/app.js` |
| Google OAuth redirect mismatch | Production URL not in Google Console | Add Vercel URL to Authorised Redirect URIs |
| MongoDB timeout | Atlas Network Access not open | Add `0.0.0.0/0` to Atlas IP allowlist (or Render outbound IPs) |

---

## 🔮 Future Improvements

- Progressive Web App (PWA) with offline leaf-scan cache
- On-device TensorFlow Lite model for instant predictions without a server round-trip
- Farmer marketplace — connect buyers/sellers based on crop recommendation output
- Satellite/drone image integration via Google Earth Engine
- SMS weather alerts via Twilio
- Redis caching for crop recommendation results
- Rate limiting and API key rotation for production hardening
- CI/CD with GitHub Actions + automated Render/Vercel deploys

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes using Conventional Commits: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request describing what you changed and why

---

## 📜 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
