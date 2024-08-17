const express = require('express');
const movieController = require('../controllers/movie.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.route('/').get(authController.protect, movieController.getAllMovies);
router.route('/:id').get(authController.protect, movieController.getMovie);

module.exports = router;
