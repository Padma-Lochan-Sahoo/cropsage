import express from "express";
import {
  getWeatherAdvisory,
  getWeatherByLocation,
  reverseGeocode,
  getCropSuggestionsFromWeather,
} from "../controllers/weatherController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getWeatherAdvisory);
router.get("/location", auth, getWeatherByLocation);
router.get("/reverse-geocode", auth, reverseGeocode);
router.post("/crop-suggestions", auth, getCropSuggestionsFromWeather);

export default router;
