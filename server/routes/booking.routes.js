const router = require("express").Router();
const ctrl = require("../controllers/booking.controller");
const { protect, authorize } = require("../middleware/auth");

router.get("/me", protect, ctrl.getMine);
router.post("/", protect, authorize("member"), ctrl.create);
router.patch("/:id/cancel", protect, ctrl.cancel);

module.exports = router;
