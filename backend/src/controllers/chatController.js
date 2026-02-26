import OpenAI from "openai";
import Conversation from "../models/Conversation.js";
import Chat from "../models/Chat.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT =
  "You are a helpful assistant specialized in crop, agriculture, irrigation, and plant diseases. You only have knowledge about these topics and nothing else. If the user asks about any other topic, you must respond exactly with: 'I am not trained in this topic.'";

export const getConversations = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const conversations = await Conversation.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const conversation = await Conversation.findOne({
      _id: id,
      user: req.user.id,
    });
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = await Chat.find({ conversation: id })
      .sort({ createdAt: 1 })
      .lean();

    const formatted = messages.flatMap((m) => [
      { role: "user", content: m.prompt, id: `${m._id}-user`, createdAt: m.createdAt },
      { role: "assistant", content: m.response, id: `${m._id}-assistant`, createdAt: m.createdAt },
    ]);

    return res.json({ conversation, messages: formatted });
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const chat = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { prompt, conversationId } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Invalid input" });
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        user: req.user.id,
      });
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
    } else {
      const title = prompt.slice(0, 50) + (prompt.length > 50 ? "…" : "");
      conversation = await Conversation.create({
        user: req.user.id,
        title,
      });
    }

    const pastMessages = await Chat.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .lean();

    const openaiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...pastMessages.flatMap((m) => [
        { role: "user", content: m.prompt },
        { role: "assistant", content: m.response },
      ]),
      { role: "user", content: prompt },
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
      messages: openaiMessages,
      max_tokens: 512,
      temperature: 0.2,
    });

    const responseText =
      completion.choices?.[0]?.message?.content?.trim() || "";

    const chatRecord = await Chat.create({
      user: req.user.id,
      conversation: conversation._id,
      prompt,
      response: responseText,
    });

    const updates = { updatedAt: new Date() };
    if (!conversation.title || conversation.title === "New chat") {
      updates.title = prompt.slice(0, 50) + (prompt.length > 50 ? "…" : "");
    }
    await Conversation.updateOne({ _id: conversation._id }, updates);

    return res.json({
      response: responseText,
      chat: chatRecord,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return res
      .status(500)
      .json({ error: error?.message || "Failed to generate response" });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const conversation = await Conversation.findOne({
      _id: id,
      user: req.user.id,
    });
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    await Chat.deleteMany({ conversation: id });
    await Conversation.deleteOne({ _id: id });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return res.status(500).json({ error: "Failed to delete conversation" });
  }
};
