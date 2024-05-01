const httpStatus = require("http-status");
const mongoose = require("mongoose");
const config = require("config");
const ApiError = require("../helpers/ApiError");

const errorConverter = (err, req, res, next) => {
      let error = err;
      if (!(error instanceof ApiError)) {
            const statusCode =
                  error.statusCode || error instanceof mongoose.Error
                        ? httpStatus.BAD_REQUEST
                        : httpStatus.INTERNAL_SERVER_ERROR;
            const message = error.message || httpStatus[statusCode];
            error = new ApiError(message, statusCode, false, err.stack);
      }
      next(error);
};

const errorHandler = (err, req, res, next) => {
      if (config.env === "production" && !err.isOperational) {
            err.code = httpStatus.INTERNAL_SERVER_ERROR;
            err.message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
      }
      res.locals.errorMessage = err.message;
      return res.failure(err);
};

module.exports = {
      errorConverter,
      errorHandler,
};