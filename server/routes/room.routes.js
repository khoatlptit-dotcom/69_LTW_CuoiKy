const router = require('express').Router();
const ctrl = require('../controllers/room.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), ctrl.getAll);
router.get('/:id/seats', protect, ctrl.getSeats);
router.get('/:id', protect, authorize('admin'), ctrl.getOne);
router.post('/', protect, authorize('admin'), ctrl.create);
router.put('/:id', protect, authorize('admin'), ctrl.update);
router.delete('/:id', protect, authorize('admin'), ctrl.remove);

module.exports = router;