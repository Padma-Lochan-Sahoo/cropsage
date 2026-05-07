import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.js";
import diseaseRoute from "./src/routes/diseaseRoute.js";
import chatRoute from "./src/routes/chatRoute.js";
import profileRoute from "./src/routes/profileRoute.js";
import weatherRoute from "./src/routes/weatherRoute.js";
import fertilizerRoute from "./src/routes/fertilizerRoute.js";
import connectDB from "./src/config/db.js";
dotenv.config();

const app = express();


// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: [
    "https://cropsage-zeta.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true
}));

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});
app.use(express.json());


app.get('/', (req, res) => {
    res.send(`Welcome to Crop Sage Backend! `);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/disease", diseaseRoute);
app.use("/api/chat", chatRoute);
app.use("/api/profile", profileRoute);
app.use("/api/weather", weatherRoute);
app.use("/api/fertilizer", fertilizerRoute);

const Flask_SERVER_URL = process.env.FLASK_SERVER_URL || "http://127.0.0.1:5000";
console.log(`Flask server ${Flask_SERVER_URL}`);

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
