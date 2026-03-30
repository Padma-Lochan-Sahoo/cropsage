/**
 * Crop Recommendation Controller
 * Forwards soil & weather parameters to Flask ML API for crop recommendation.
 * Inputs: Nitrogen, Phosphorus, Potassium, temperature, humidity, ph, rainfall
 */

import axios from "axios";
import FormData from "form-data";
import OpenAI from "openai";

const CROP_API_URL = process.env.CROP_RECOMMENDATION_API_URL || "http://127.0.0.1:5000";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const parseCropName = (value) => {
  if (!value || typeof value !== "string") return null;
  const cleaned = value.replace(/^recommended crop[:\-]?\s*/i, "").trim();
  if (!cleaned) return null;
  const match = cleaned.match(/^[A-Za-z][A-Za-z\s-]*/);
  return (match?.[0] || cleaned).trim();
};

const generateCultivationGuide = async (payload) => {
  const {
    crop,
    result,
    nitrogen,
    phosphorus,
    potassium,
    temperature,
    humidity,
    ph,
    rainfall,
  } = payload;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 1200,
    messages: [
      {
        role: "system",
        content:
          "You are an expert agronomist for Indian farmers. " +
          "Provide highly practical, in-depth, and easy-to-follow cultivation guidance. " +
          "Return only valid JSON with keys: " +
          "overview (string), climate_and_soil_fit (string), land_preparation (array of strings), sowing_plan (array of strings), nutrient_plan (array of strings), irrigation_plan (array of strings), weed_and_pest_management (array of strings), disease_management (array of strings), harvesting_and_post_harvest (array of strings), mistakes_to_avoid (array of strings), seasonal_timeline (array of strings), expected_outcome (string).",
      },
      {
        role: "user",
        content:
          `Model recommended crop: ${crop || "Unknown"}\n` +
          `Raw model output: ${result}\n` +
          `Soil/Weather values:\n` +
          `Nitrogen: ${nitrogen}\n` +
          `Phosphorus: ${phosphorus}\n` +
          `Potassium: ${potassium}\n` +
          `Temperature: ${temperature} C\n` +
          `Humidity: ${humidity} %\n` +
          `pH: ${ph}\n` +
          `Rainfall: ${rainfall} mm\n\n` +
          "Give a detailed but farmer-friendly cultivation plan with field actions, timing and practical checks.",
      },
    ],
  });

  const content = completion.choices?.[0]?.message?.content?.trim() || "{}";
  return JSON.parse(content);
};

/**
 * POST /api/fertilizer/recommend
 * Body: { nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall }
 * All numeric values. Model predicts best crop to cultivate.
 */
export const recommend = async (req, res) => {
  try {
    const {
      nitrogen,
      phosphorus,
      potassium,
      temperature,
      humidity,
      ph,
      rainfall,
    } = req.body || {};

    const n = parseInt(nitrogen, 10);
    const p = parseInt(phosphorus, 10);
    const k = parseInt(potassium, 10);
    const temp = parseFloat(temperature);
    const hum = parseFloat(humidity);
    const phVal = parseFloat(ph);
    const rain = parseFloat(rainfall);

    if (
      Number.isNaN(n) ||
      Number.isNaN(p) ||
      Number.isNaN(k) ||
      Number.isNaN(temp) ||
      Number.isNaN(hum) ||
      Number.isNaN(phVal) ||
      Number.isNaN(rain)
    ) {
      return res.status(400).json({
        msg: "All fields are required: nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall (numeric values)",
      });
    }

    const formData = new FormData();
    formData.append("Nitrogen", String(n));
    formData.append("Phosphorus", String(p));
    formData.append("Potassium", String(k));
    formData.append("Temperature", String(temp));
    formData.append("Humidity", String(hum));
    formData.append("pH", String(phVal));
    formData.append("Rainfall", String(rain));

    const response = await axios.post(
      `${CROP_API_URL}/recommend-crop`,
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    const { result } = response.data || {};
    const crop = parseCropName(result);

    let cultivationGuide = null;
    if (process.env.OPENAI_API_KEY && crop) {
      try {
        cultivationGuide = await generateCultivationGuide({
          crop,
          result,
          nitrogen: n,
          phosphorus: p,
          potassium: k,
          temperature: temp,
          humidity: hum,
          ph: phVal,
          rainfall: rain,
        });
      } catch (openAiErr) {
        console.error("Cultivation guide generation error:", openAiErr.message);
      }
    }

    return res.json({
      result: result || "Could not get recommendation",
      crop,
      cultivationGuide,
    });
  } catch (err) {
    console.error("Crop recommendation error:", err.message);
    const status = err.response?.status || 500;
    const msg =
      err.response?.data?.error || err.message || "Crop recommendation failed";
    return res.status(status === 200 ? 500 : status).json({
      msg: typeof msg === "string" ? msg : "Crop recommendation failed",
    });
  }
};
