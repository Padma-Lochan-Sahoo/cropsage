import express from "express";
import { getWeatherAdvisory, getWeatherByLocation, reverseGeocode } from "../controllers/weatherController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getWeatherAdvisory);
router.get("/location", auth, getWeatherByLocation);
router.get("/reverse-geocode", auth, reverseGeocode);

export default router;
