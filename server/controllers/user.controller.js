import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// generate jwt
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// API to register user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({ message: "User already exist" });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = generateToken(user._id);

    res.json({ success: true, token });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// API to login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    return res.json({ success: true, token });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// API to get user data
export const getUser = async (req, res) => {
  try {
    const user = req.user;

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
