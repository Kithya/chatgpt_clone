import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const protect = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Not authorized" });
  }
};

export default protect;
