require('dotenv').config();
const { app } = require('./app');
const http = require('http');
let server = http.createServer(app);
const socketConnection = require('./src/socket');

const logger = require('./helpers/logger')();
const webServer = require('config').get('webServer');
global.ApiError = require('./helpers/ApiError');

try {
  require('./helpers/string');
  require('./settings/database').configure();
  socketConnection(server);
} catch (err) {
  console.log(err);
}

server = server.listen(webServer.port, () => {
  logger.debug(`Listening to port ${webServer.port}`);
  console.log(`Listening to port ${webServer.port}`);
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
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
  if (server) {
    server.close();
  }
});
