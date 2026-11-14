const { isValidObjectId } = require("mongoose");
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
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email ||
      !password
    ) {
      return res.status(400).json({ message: "Thiếu email hoặc mật khẩu" });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.listUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const filter = {};
    if (req.query.search) {
      const regex = new RegExp(escapeRegex(String(req.query.search)), "i");
      filter.$or = [{ name: regex }, { email: regex }];
    }
    if (req.query.role)
      filter.role = { $in: String(req.query.role).split(",") };

    const [items, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);
    res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "ID không hợp lệ" });
    if (!["member", "admin"].includes(role))
      return res.status(400).json({ message: "Role không hợp lệ" });
    if (req.user.id === id)
      return res
        .status(400)
        .json({ message: "Không thể tự đổi quyền của chính mình" });

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true },
    ).select("-password");
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};
