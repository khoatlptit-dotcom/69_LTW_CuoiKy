const router = require('express').Router();
const ctrl = require('../controllers/movie.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/', ctrl.getAll); // ?q=&genre=&date=&page=&limit=
router.get('/:id', ctrl.getById);
router.post('/', protect, authorize('admin'), ctrl.create);
router.put('/:id', protect, authorize('admin'), ctrl.update);
router.delete('/:id', protect, authorize('admin'), ctrl.remove);
module.exports = router;
