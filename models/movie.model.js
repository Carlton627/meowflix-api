const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A movie requires a name'],
        trim: true,
    },
    url: {
        type: String,
        required: [true, 'A url is required to stream the movie'],
    },
    uploadedBy: String,
    hide: { type: Boolean, default: false },
});

movieSchema.pre(/^find/, function (next) {
    this.find({ hide: { $eq: false } });
    next();
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
