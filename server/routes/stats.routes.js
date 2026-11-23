const router = require('express').Router();
const ctrl = require('../controllers/stats.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/overview', ctrl.overview);
router.get('/revenue-by-movie', ctrl.revenueByMovie);
router.get('/revenue-by-day', ctrl.revenueByDay);

module.exports = router;