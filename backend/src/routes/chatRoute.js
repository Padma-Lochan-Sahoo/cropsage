import express from "express";
import auth from "../middleware/auth.js";
import {
  chat,
  getConversations,
  getConversationMessages,
  deleteConversation,
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/", auth, chat);
router.get("/conversations", auth, getConversations);
router.get("/conversations/:id/messages", auth, getConversationMessages);
router.delete("/conversations/:id", auth, deleteConversation);

export default router;

