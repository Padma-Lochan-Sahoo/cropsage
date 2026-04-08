# CropSage

CropSage is an AI-powered agriculture assistant with three core modules:
- `frontend`: React + Vite user interface
- `backend`: Node.js/Express API with auth, chat, weather, profile, disease, and fertilizer routes
- `CNN_for_disease_detection`: Flask + TensorFlow service for plant disease prediction and crop recommendation

## Features

- Agriculture-focused chatbot with conversation history
- Plant disease prediction from uploaded leaf images
- AI-generated treatment suggestions for detected diseases
- Weather advisory and crop suggestions
- Crop recommendation from soil and weather metrics
- User authentication (email/password + Google OAuth)

## Project Structure

```text
CropSage/
├── frontend/                     # React (Vite) client
├── backend/                      # Express API server
└── CNN_for_disease_detection/    # Flask ML service (TensorFlow + sklearn)
```

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, OpenAI API
- ML service: Flask, TensorFlow, scikit-learn, Pillow
- External APIs: OpenWeather, Google OAuth

## Prerequisites

- Node.js 18+
- npm 9+
- Python 3.10+ (recommended for TensorFlow compatibility)
- MongoDB instance (local or cloud)
- API keys:
  - OpenAI API key
  - OpenWeather API key
  - Google OAuth client credentials

## Environment Variables

### `backend/.env`

You can copy `backend/.env.sample` and extend it with the fields below:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OPENAI_API_KEY=your_openai_api_key
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENWEATHER_API_KEY=your_openweather_api_key
CROP_RECOMMENDATION_API_URL=http://127.0.0.1:5000
```

### `frontend/.env`

Copy `frontend/.env.sample` and configure:

```env
VITE_API_BASE_URL=http://localhost:5001
VITE_FLASK_API_URL=http://127.0.0.1:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_ENV=development
```

## Local Setup

### 1) Clone repository

```bash
git clone https://github.com/Zaimr49/CropSage.git
cd CropSage
```

### 2) Start ML service (`CNN_for_disease_detection`)

```bash
cd CNN_for_disease_detection
python -m venv .venv
```

Activate venv:
- Windows (PowerShell): `.\.venv\Scripts\Activate.ps1`
- macOS/Linux: `source .venv/bin/activate`

Install dependencies and run:

```bash
pip install -r requirements.txt
python app.py
```

Default Flask URL: `http://127.0.0.1:5000`

### 3) Start backend API (`backend`)

```bash
cd backend
npm install
npm run dev
```

Default backend URL: `http://localhost:5001`

### 4) Start frontend (`frontend`)

```bash
cd frontend
npm install
npm run dev -- --port 3000
```

Frontend URL: `http://localhost:3000`

> Note: Backend CORS is currently set to allow `http://localhost:3000`.

## API Overview

Base URL: `http://localhost:5001`

- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth auth
- `POST /api/chat` - Ask agriculture chatbot (auth required)
- `POST /api/disease/predict` - Predict disease from image
- `GET /api/weather` - Weather advisory (auth required)
- `POST /api/fertilizer/recommend` - Crop recommendation (auth required)
- `GET /api/profile` - Get user profile (auth required)

## ML Service Endpoints

Base URL: `http://127.0.0.1:5000`

- `POST /predict` - Plant disease classification from image
- `POST /recommend-crop` - Crop recommendation from NPK + climate values

## Troubleshooting

- TensorFlow install issues: ensure compatible Python version and reinstall in fresh venv.
- CORS errors: run frontend on `http://localhost:3000` or update backend CORS origin.
- Mongo connection errors: verify `MONGO_URI` and network/IP whitelist for cloud DB.
- 500 from AI features: check `OPENAI_API_KEY` and model name in backend env.
- Weather endpoint failures: validate `OPENWEATHER_API_KEY`.

## License

This project is licensed under the MIT License. See `LICENSE`.
