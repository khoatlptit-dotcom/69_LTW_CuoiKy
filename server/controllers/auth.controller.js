const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

const publicUser = ({ _id, name, email, role }) => ({
  id: _id,
  name,
  email,
  role,
});

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      typeof password !== "string" ||
      password.length < 6
    ) {
      return res
        .status(400)
        .json({ message: "Cần tên, email hợp lệ và mật khẩu từ 6 ký tự" });
    }
    const normalized = email.toLowerCase();
    if (await User.findOne({ email: normalized })) {
      return res.status(409).json({ message: "Email đã được sử dụng" });
    }
    const hashed = await bcrypt.hash(password, 10);
    // Không nhận role từ body: người đăng ký luôn là member
    const user = await User.create({
      name: name.trim(),
      email: normalized,
      password: hashed,
    });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: "Email đã được sử dụng" });
    next(err);
  }
};
