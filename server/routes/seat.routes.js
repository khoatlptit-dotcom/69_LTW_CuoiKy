const router = require('express').Router();
const ctrl = require('../controllers/seat.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/showtime/:showtimeId', protect, ctrl.getSeatMap);
router.get('/hold/:showtimeId', protect, authorize('member'), ctrl.getMyHold);
router.post('/hold', protect, authorize('member'), ctrl.hold);
router.delete('/hold/:showtimeId', protect, authorize('member'), ctrl.release);

module.exports = router;