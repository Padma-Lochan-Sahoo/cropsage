import User from "../models/User.js";

/**
 * GET /api/profile
 * Fetch current user's profile (requires auth)
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -__v")
      .lean();
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * PATCH /api/profile
 * Update current user's profile (requires auth)
 */
export const updateProfile = async (req, res) => {
  try {
    const { username, phone, farmLocation, bio, image } = req.body;

    const updates = {};
    if (username !== undefined) updates.username = username;
    if (phone !== undefined) updates.phone = phone;
    if (farmLocation !== undefined) updates.farmLocation = farmLocation;
    if (bio !== undefined) updates.bio = bio;
    if (image !== undefined) updates.image = image;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .select("-password -__v")
      .lean();

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).json({ msg: "Server error" });
  }
};
