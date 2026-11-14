const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const {
  register,
  login,
  me,
  listUsers,
  updateUserRole,
} = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.get("/users", protect, authorize("admin"), listUsers);
router.patch("/users/:id/role", protect, authorize("admin"), updateUserRole);

module.exports = router;
