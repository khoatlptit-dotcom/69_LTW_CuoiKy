const router = require("express").Router();
const ctrl = require("../controllers/booking.controller");
const { protect, authorize } = require("../middleware/auth");

router.get("/", ctrl.getAll);
router.post("/", protect, ctrl.create);

module.exports = router;
