import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// SIGNUP
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    const payload = { user: { id: user.id } };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GOOGLE SIGNUP AND LOGIN
export const googleAuth = async (req, res) => {
    try {
      const { token } = req.body;
  
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
  
      const { name, email, picture, sub } = ticket.getPayload();
  
      let user = await User.findOne({ email });
  
      if (!user) {
        user = new User({
          googleId: sub,
          username: name,
          email,
          image: picture,
        });
  
        await user.save();
      } else if (!user.googleId) {
        user.googleId = sub;
        await user.save();
      }
  
      const payload = { user: { id: user.id } };
      const jwtToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
  
      res.json({ token: jwtToken });
  
    } catch (error) {
      res.status(500).json({ message: "Google authentication failed" });
    }
  };
  
  