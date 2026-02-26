import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String },

    googleId: { type: String, unique: true, sparse: true },

    image: { type: String },

    // Farmer profile fields
    phone: { type: String, trim: true },
    farmLocation: { type: String, trim: true },
    bio: { type: String, trim: true },

  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });

export default mongoose.model("User", UserSchema);
