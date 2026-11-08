const router = require('express').Router();
const ctrl = require('../controllers/room.controller');
const { protect, authorize } = require('../middleware/auth');

// TODO: khai báo route cho room
router.get('/', ctrl.getAll);
module.exports = router;
