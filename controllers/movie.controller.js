const Movie = require('../models/movie.model');
const catchAsync = require('../utils/catchAsync');

const getAllMovies = catchAsync(async (req, res, next) => {
    let docs = await Movie.find({});

    res.status(200).json({
        status: 'success',
        results: docs.length,
        data: docs,
    });
});

const getMovie = catchAsync(async (req, res, next) => {
    const doc = await Movie.findOne({ _id: req.params.id }).lean();

    res.status(200).json({
        status: 'success',
        data: doc,
    });
});

module.exports = { getAllMovies, getMovie };
