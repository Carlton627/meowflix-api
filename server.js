const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose
    .connect(DB, {
        serverApi: { version: '1', strict: true, deprecationErrors: true },
    })
    .then(() => console.log('DB connection successful'));

const port = 3000;
const server = app.listen(port, async () => {
    console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    // best practice: gracefully shutdown
    server.close(async () => {
        await mongoose.disconnect();
        process.exit(1);
    });
});

// Handle SIGTERM signal (e.g., from Kubernetes or Heroku)
process.on('SIGTERM', () => {
    console.log('SIGTERM RECEIVED. Shutting down gracefully...');
    server.close(async () => {
        await mongoose.disconnect();
        console.log('💥 Process terminated!');
        process.exit(0);
    });
});

// Handle SIGINT signal (e.g., Ctrl+C in terminal)
process.on('SIGINT', () => {
    console.log('SIGINT RECEIVED. Shutting down gracefully...');
    server.close(async () => {
        await mongoose.disconnect();
        console.log('💥 Process terminated!');
        process.exit(0);
    });
});
