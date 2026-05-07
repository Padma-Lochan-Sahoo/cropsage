/**
 * diseaseController.js
 *
 * Receives a leaf image from the frontend, forwards it to the Flask AI server
 * as multipart/form-data, then enriches the prediction with OpenAI treatment
 * advice before returning the result to the client.
 *
 * KEY FIX: formData.append() now passes an explicit options object that
 * includes filename AND contentType.  Without contentType, some Node.js
 * versions / Render environments send an empty Content-Type header for the
 * file part, causing Flask's request.files to be empty → 400 "No image".
 */

import axios from "axios";
import FormData from "form-data";
import OpenAI from "openai";

const FLASK_SERVER_URL =
  process.env.FLASK_SERVER_URL || "http://127.0.0.1:5000";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --------------------------------------------------------------------------
// Helper: forward image buffer to Flask /predict
// --------------------------------------------------------------------------
async function callFlaskPredict(file) {
  const form = new FormData();

  // Pass filename and contentType so Flask gets a proper Content-Disposition
  // and Content-Type for the file part — required for request.files to work.
  form.append("image", file.buffer, {
    filename:    file.originalname || "upload.jpg",
    contentType: file.mimetype     || "image/jpeg",
    knownLength: file.buffer.length,
  });

  const flaskUrl = `${FLASK_SERVER_URL}/predict`;

  console.log(`[disease] Forwarding image to Flask: ${flaskUrl}`);
  console.log(`[disease] Image size: ${file.buffer.length} bytes, mime: ${file.mimetype}`);

  const response = await axios.post(flaskUrl, form, {
    headers: {
      ...form.getHeaders(),
    },
    // 3 min timeout — CNN inference on Render free tier can take 30-60 s
    // after a cold start; give enough room.
    timeout: 180_000,
    maxContentLength: Infinity,
    maxBodyLength:    Infinity,
  });

  return response.data;
}

// --------------------------------------------------------------------------
// Helper: generate treatment advice via OpenAI
// --------------------------------------------------------------------------
async function getTreatmentAdvice(plant, diseaseName, confidence) {
  const completion = await openai.chat.completions.create({
    model:           process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
    response_format: { type: "json_object" },
    max_tokens:      600,
    temperature:     0.2,
    messages: [
      {
        role:    "system",
        content:
          "You are an agricultural expert. Given a crop and a plant disease, " +
          "provide concise, practical treatment advice for farmers in India. " +
          "Respond ONLY as a JSON object with keys: " +
          "short_summary (string), causes (string), " +
          "organic_treatment (array of strings), " +
          "chemical_treatment (array of strings), " +
          "preventive_measures (array of strings), notes (string). " +
          "Keep language simple and actionable.",
      },
      {
        role:    "user",
        content:
          `Crop: ${plant || "Unknown"}\n` +
          `Disease: ${diseaseName || "Unknown"}\n` +
          `Model confidence: ${confidence ?? "unknown"}%\n` +
          "Give treatment advice in the requested JSON format.",
      },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content?.trim() || "";
  try {
    return JSON.parse(raw);
  } catch {
    return { raw };   // still return something if JSON parse fails
  }
}

// --------------------------------------------------------------------------
// Controller
// --------------------------------------------------------------------------
export const predictDisease = async (req, res) => {
  try {
    // ── Validate upload ───────────────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: `Unsupported image type: ${req.file.mimetype}. Use JPG or PNG.`,
      });
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (req.file.size > MAX_SIZE) {
      return res.status(400).json({
        message: `Image too large (${(req.file.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.`,
      });
    }

    // ── Forward to Flask ──────────────────────────────────────────────────
    let prediction;
    try {
      prediction = await callFlaskPredict(req.file);
    } catch (flaskErr) {
      const status  = flaskErr.response?.status;
      const detail  = flaskErr.response?.data || flaskErr.message;

      console.error("[disease] Flask error:", status, detail);

      // Surface the actual Flask error message to the client for easier debugging
      return res.status(502).json({
        message: "AI prediction service error",
        error:   detail,
        hint:    "Check that FLASK_SERVER_URL is set correctly in Render environment variables.",
      });
    }

    // ── Parse plant / disease names ───────────────────────────────────────
    let plant       = null;
    let diseaseName = null;

    if (prediction?.disease && typeof prediction.disease === "string") {
      const [rawPlant, rawDisease] = prediction.disease.split("___");
      plant       = rawPlant   ? rawPlant.replaceAll("_", " ")   : null;
      diseaseName = rawDisease ? rawDisease.replaceAll("_", " ") : null;
    }

    // ── Get treatment advice (non-fatal — skip if OpenAI key missing) ─────
    let treatmentAdvice = null;

    if ((plant || diseaseName) && process.env.OPENAI_API_KEY) {
      try {
        treatmentAdvice = await getTreatmentAdvice(
          plant,
          diseaseName,
          prediction.confidence,
        );
      } catch (aiErr) {
        // Treatment advice is optional; log but don't fail the request
        console.error("[disease] OpenAI treatment error:", aiErr.message);
      }
    }

    return res.status(200).json({
      ...prediction,
      plant,
      diseaseName,
      treatmentAdvice,
    });

  } catch (err) {
    console.error("[disease] Unexpected error:", err.message || err);
    return res.status(500).json({
      message: "Prediction failed",
      error:   err.message,
    });
  }
};
