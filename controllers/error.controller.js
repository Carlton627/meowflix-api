const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // Programming or other unknown error: don't leak error details
        // 1. Log error
        console.error('ERROR 💥', err);
        // 2. Send generic message
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
};

const handleCastErrorDB = error => {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = error => {
    // const value = error.errmsg.match(/(["'])(\\?.)*?\1/);
    // console.log(value);
    const message = `Duplicate field value: ${error.keyValue.name}, Please use another value`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = error => {
    const errors = Object.values(error.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = () =>
    new AppError('Invalid token. Please login again', 401);

const handleJWTExpiredError = () =>
    new AppError('Token expired! Please login again', 401);

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };

        if (err.name === 'CastError') {
            error = handleCastErrorDB(error);
        }

        if (err.code === 11000) {
            error = handleDuplicateFieldsDB(error);
        }

        if (err.name === 'ValidationError') {
            error = handleValidationErrorDB(error);
        }

        if (err.name === 'JsonWebTokenError') {
            error = handleJWTError();
        }

        if (err.name === 'TokenExpiredError') {
            error = handleJWTExpiredError();
        }

        sendErrorProd(error, res);
    }
};
