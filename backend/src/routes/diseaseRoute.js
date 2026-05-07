import express from "express";
import multer from "multer";
import { predictDisease } from "../controllers/diseaseController.js";

const router = express.Router();

// Memory storage — no temp files on Render's ephemeral filesystem
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error(`Only image files are allowed. Received: ${file.mimetype}`));
    }
  },
});

// Multer error handler middleware
function handleUploadError(err, _req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
}

router.post(
  "/predict",
  upload.single("image"),
  handleUploadError,
  predictDisease,
);

export default router;
