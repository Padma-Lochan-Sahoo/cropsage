import express from "express";
import { recommend } from "../controllers/fertilizerController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/recommend", auth, recommend);

export default router;
