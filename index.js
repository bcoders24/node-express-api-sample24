require('dotenv').config();
const { app } = require('./app');
const http = require('http');
const  server = http.createServer(app);
const socketConnection = require('./src/socket/app');

const logger = require('./helpers/logger')();
const webServer = require('config').get('webServer');
global.ApiError = require('./helpers/ApiError');


try {
    require('./helpers/string');
    require('./settings/database').configure();
    socketConnection.configure(server)
} catch (err) {
    console.log(err);
}

const newServer = app.listen(webServer.port, () => {
    logger.debug(`Listening to port ${webServer.port}`);
    console.log(`Listening to port ${webServer.port}`);
});

const exitHandler = () => {
    if (newServer) {
        newServer.close(() => {
            logger.info('Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error) => {
    logger.error(error);
    console.error('Uncaught Exception:', error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (newServer) {
        newServer.close();
    }
});
