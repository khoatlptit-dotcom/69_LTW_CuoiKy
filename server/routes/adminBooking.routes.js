const router = require('express').Router();
const ctrl = require('../controllers/adminBooking.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/', ctrl.getAll);

module.exports = router;