import express from "express";
import multer from "multer";
import { predictDisease } from "../controllers/diseaseController.js";

const router = express.Router();
const upload = multer();

router.post("/predict", upload.single("image"), predictDisease);

export default router;
