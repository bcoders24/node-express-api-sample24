require('dotenv').config();
import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import logger from './helpers/logger';
import config from 'config';
import ApiError from './helpers/ApiError';

const app = require('./app');
const newApp = express();
const server = http.createServer(newApp);
const io = socketIO(server);

global.ApiError = ApiError;

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle socket disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

try {
  require('./helpers/string');
  require('./settings/database').configure();
} catch (err) {
  console.log(err);
}

const webServer =process.env

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