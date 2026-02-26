import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "New chat",
      trim: true,
    },
  },
  { timestamps: true }
);

ConversationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Conversation", ConversationSchema);
