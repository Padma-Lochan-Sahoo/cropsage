import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.js";
import diseaseRoute from "./src/routes/diseaseRoute.js";
import chatRoute from "./src/routes/chatRoute.js";
import profileRoute from "./src/routes/profileRoute.js";
import connectDB from "./src/config/db.js";
dotenv.config();

const app = express();


// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());


app.get('/', (req, res) => {
    res.send(`Welcome to Crop Sage Backend! `);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/disease", diseaseRoute);
app.use("/api/chat", chatRoute);
app.use("/api/profile", profileRoute);


// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
