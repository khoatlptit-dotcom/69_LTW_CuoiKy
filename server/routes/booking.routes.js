const router = require('express').Router();
const ctrl = require('../controllers/booking.controller');
const { protect, authorize } = require('../middleware/auth');

// TODO: khai báo route cho booking
router.get('/', ctrl.getAll);
module.exports = router;
