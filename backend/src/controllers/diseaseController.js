import axios from "axios";
import FormData from "form-data";

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

    return res.status(200).json(response.data);

  } catch (error) {
    console.error("Prediction Error:", error.message);
    return res.status(500).json({ message: "Prediction failed" });
  }
};
