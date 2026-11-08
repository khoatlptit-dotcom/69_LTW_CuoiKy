const router = require('express').Router();
const ctrl = require('../controllers/stats.controller');
const { protect, authorize } = require('../middleware/auth');

// TODO: khai báo route cho stats
router.get('/', ctrl.getAll);
module.exports = router;
