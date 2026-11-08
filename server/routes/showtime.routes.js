const router = require('express').Router();
const ctrl = require('../controllers/showtime.controller');
const { protect, authorize } = require('../middleware/auth');

// TODO: khai báo route cho showtime
router.get('/', ctrl.getAll);
module.exports = router;
