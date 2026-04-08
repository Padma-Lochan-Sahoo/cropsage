import axios from "axios";
import FormData from "form-data";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const predictDisease = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const formData = new FormData();
    formData.append("image", req.file.buffer, req.file.originalname);

    const response = await axios.post(
      "http://127.0.0.1:5000/predict",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    const prediction = response.data;

    let plant = null;
    let diseaseName = null;

    if (prediction?.disease && typeof prediction.disease === "string") {
      const [rawPlant, rawDisease] = prediction.disease.split("___");
      plant = rawPlant ? rawPlant.replaceAll("_", " ") : null;
      diseaseName = rawDisease ? rawDisease.replaceAll("_", " ") : null;
    }

    let treatmentAdvice = null;

    if (plant || diseaseName) {
      try {
        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
          response_format: { type: "json_object" },
          max_tokens: 600,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "You are an agricultural expert. Given a crop and a plant disease, you provide concise, practical treatment advice for farmers in India. " +
                "Respond ONLY as a JSON object with the following keys: short_summary (string), causes (string), organic_treatment (array of strings), chemical_treatment (array of strings), preventive_measures (array of strings), notes (string). " +
                "Keep language simple and actionable.",
            },
            {
              role: "user",
              content:
                `Crop: ${plant || "Unknown"}\n` +
                `Disease: ${diseaseName || prediction.disease}\n` +
                `Model confidence (0-1, if available): ${
                  prediction.confidence ?? "unknown"
                }\n` +
                "Give treatment advice in the requested JSON format.",
            },
          ],
        });

        const messageContent =
          completion.choices?.[0]?.message?.content?.trim() || "";

        try {
          treatmentAdvice = JSON.parse(messageContent);
        } catch {
          // If parsing fails, send raw text so frontend can still show something
          treatmentAdvice = { raw: messageContent };
        }
      } catch (openAiError) {
        console.error("Treatment generation error:", openAiError);
      }
    }

    return res.status(200).json({
      ...prediction,
      plant,
      diseaseName,
      treatmentAdvice,
    });
  } catch (error) {
    console.error("Prediction Error:", error.message || error);
    return res.status(500).json({ message: "Prediction failed" });
  }
};
