const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Please tell us your name'] },
    username: {
        type: String,
        required: [true, 'Please set a user name'],
        unique: true,
        maxlength: [40, 'User name too long, (40 characters exceeded)'],
        minlength: [6, 'User name too short'],
    },
    password: {
        type: String,
        required: [true, 'Please set a password'],
        minlength: 8,
        select: false,
    },
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});

userSchema.pre('save', async function (next) {
    // only run this func if password as actually modified
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.pre(/^find/, function (next) {
    // this points to current query
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async function (candidatePass, userPass) {
    return await bcrypt.compare(candidatePass, userPass);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
