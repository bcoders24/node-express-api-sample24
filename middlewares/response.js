"use strict";
let config = require('config');
const logger = require("../helpers/logger")();
const httpStatus = require("http-status");
const moment = require('moment');

exports.decorate = (req, res) => {
      const log = logger.start({
            location: req.method + " " + req.url,
            method: req.method,
            url: req.url,
      });

      res.log = log;
      res.logger = log;

      if (req.body) {
            log.debug(req.body);
      }

      res.success = (message, code) => {
            res.status(code || httpStatus.OK);
            let val = {
                  isSuccess: true,
                  message: message,
                  code: code
            };
            log.silly(message || "success", val);
            log.end();
            res.json(val);
      };

      res.failure = (error, message, code) => {
            res.status(code || error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);

            let val = {
                  isSuccess: false,
                  code: error.statusCode,
                  message: message || error.message || "Internal Server Error",
                  // @ts-ignore
                  ...(config.env === "dev" && { stack: error.stack })
            };

            log.error(val.message || "failed", error);
            log.end();

            res.json(val);
      };

      res.accessDenied = (message) => {
            res.status(httpStatus.FORBIDDEN);
            let val = {
                  isSuccess: false,
                  message: message || httpStatus[httpStatus.FORBIDDEN],
                  error: "ACCESS_DENIED",
                  code: httpStatus.FORBIDDEN,
            };

            log.error(message || "failed", val);
            log.end();
            res.json(val);
      };

      res.data = (item, code, message) => {
            res.status(code || httpStatus.OK);
            let val = {
                  isSuccess: true,
                  code: code,
                  message: message || 'success',
                  data: item,

            };
            log.silly(message || "success", val);
            log.end();

            if (item.timeStamp) {
                  res.set(
                        "Last-Modified",
                        moment(item.timeStamp).toISOString()
                  );
            }

            res.json(val);
      };

      res.page = (pageItems) => {
            let val = {
                  isSuccess: true,
                  ...pageItems
            };

            log.silly("page", val);
            log.end();
            res.json(val);
      };
};
