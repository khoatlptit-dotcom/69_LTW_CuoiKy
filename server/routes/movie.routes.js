const router = require('express').Router();
const ctrl = require('../controllers/movie.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/', ctrl.getAll); // ?q=&genre=&date=&page=&limit=
// TODO: GET /:id, POST/PUT/DELETE (admin)
module.exports = router;
