const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/error.controller');

const userRouter = require('./routes/user.routes');
const movieRouter = require('./routes/movie.routes');

const app = express();

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const corsOptions = {
    origin: ['http://localhost:4200', 'https://meowflix-rho.vercel.app'], // Add both local and production URLs
    optionsSuccessStatus: 200, // For legacy browsers
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!',
    standardHeaders: true,
    legacyHeaders: false,
});

app.set('trust proxy', 1);

app.use(cors(corsOptions));

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));

app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.use('/api/v1/users', userRouter);
app.use('/api/v1/movies', movieRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
