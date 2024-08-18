const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const User = require('../models/user.model');

const signToken = user => {
    return jwt.sign({ user }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createToken = catchAsync((user, statusCode, res) => {
    const token = signToken({
        name: user.name,
        username: user.username,
        _id: user._id,
    });
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined; // remove password from output

    res.status(statusCode).json({
        status: 'success',
        token,
        data: user,
    });
});

const register = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
    });

    createToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password)
        return next(new AppError('Please provide email and password', 400));

    const user = await User.findOne({ username }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password)))
        return next(new AppError('Incorrect email or password', 401));

    if (!user.active) return next(new AppError('User inactive', 403));

    createToken(user, 200, res);
});

const protect = catchAsync(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token)
        return next(
            new AppError(
                'You are not logged in! Please login to get access',
                401
            )
        );

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.user._id);
    if (!currentUser)
        return next(
            new AppError(
                'The user belonging to the token no longer exists.',
                401
            )
        );

    req.user = currentUser;
    next();
});

module.exports = { register, login, protect };
