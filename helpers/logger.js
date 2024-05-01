'use strict'
const winston = require('winston');
const config = require('config');
const logConfig = config.get('logger');

winston.level = logConfig.level || 'info'

var transports = []

for (const type of Object.getOwnPropertyNames(logConfig)) {
  if (typeof logConfig[type] === 'function' || type === 'util') {
    continue
  }
  switch (type.toLowerCase()) {
    case 'file':
      transports.push(new winston.transports.File(logConfig.file))
      break

    case 'console':
      transports.push(new winston.transports.Console(logConfig.console))
      break

    case 'http':
      transports.push(new winston.transports.Http(logConfig.http))
      break

    case 'custom':
      var CustomLogger = function (options) {
        const handler = require(`../../../${options.handler}`)
        this.name = 'custom'
        this.level = options.level || 'info'
        this.log = (level, message, meta, callback) => {
          var context = {}
          if (meta && meta.context) {
            context = meta.context
            meta.context = undefined
          }

          handler(level, message, meta, context).then(() => {
            callback(null, true)
          })
        }
      }
      transports.push(new CustomLogger(logConfig.custom))
      break

    default:
      const provider = require(type)
      const transport = typeof provider.transport === 'function' ? provider.transport(logConfig[type]) : provider.transport
      transports.push(transport)
      break
  }
}

let defaultLogger = winston.createLogger({
  transports: transports,
  exitOnError: false
});

defaultLogger.stream = {
  write: function (message, encoding) {
    defaultLogger.info(message)
  }
}

module.exports = function (loggerName) {
  var winstonLogger = winston.createLogger({
    transports: transports,
    exitOnError: false
  })

  const getMeta = (params, context) => {
    let meta = {}
    if (params[1]) {
      if (typeof params[1] === 'string') {
        meta.message = params[1]
      } else if (typeof params[1] === 'object') {
        for (const field of Object.getOwnPropertyNames(params[1])) {
          let obj = params[1][field]
          if (typeof obj !== 'function' && field !== 'util') {
            meta[field] = obj
          }
        }
      }
    }

    meta.context = context
    return meta
  }

  var loggerFactory = function (newContext, parentLogger) {
    let context = {}

    if (parentLogger && parentLogger.context) {
      for (const key of Object.keys(parentLogger.context)) {
        context[key] = parentLogger.context[key]
      }
    }
    if (newContext) {
      if (typeof newContext === 'string') {
        context.location = context.location ? `${context.location}:${newContext}` : newContext
      } else {
        for (const key of Object.keys(newContext)) {
          if (key === 'location') {
            context.location = context.location ? `${context.location}:${newContext.location}` : newContext.location
          } else {
            context[key] = newContext[key]
          }
        }
      }
    }

    let instance = {
      context: context,
      parent: parentLogger,
      fatal: function () {
        let meta = getMeta(arguments, context)
        winstonLogger.error(arguments[0], meta)
      },
      error: function () {
        let meta = getMeta(arguments, context)
        winstonLogger.error(arguments[0], meta)
      },
      warn: function () {
        let meta = getMeta(arguments, context)
        winstonLogger.warn(arguments[0], meta)
      },
      info: function () {
        let meta = getMeta(arguments, context)
        winstonLogger.info(arguments[0], meta)
      },
      verbose: function () {
        let meta = getMeta(arguments, context)
        winstonLogger.verbose(arguments[0], meta)
      },
      debug: function () {
        let meta = getMeta(arguments, context)
        winstonLogger.debug(arguments[0], meta)
      },
      silly: function () {
        let meta = getMeta(arguments, context)
        winstonLogger.silly(arguments[0], meta)
      },
      end: function () {
        if (this.startTime) {
          let span = (new Date() - this.startTime) / 1000
          arguments[0] = arguments[0] || `took: ${span} second(s)`
          arguments[1] = arguments[1] || {}
          arguments[1].took = span
        }
        let meta = getMeta(arguments, context)
        winstonLogger.silly(arguments[0], meta)

        if (instance.parent && instance.parent.context) {
          instance.context = instance.parent.context
        }
      }
    }

    return instance
  }

  var start = function (param, parent) {
    var newLogger = loggerFactory(param, parent)
    newLogger.startTime = new Date()
    newLogger.start = function (param) {
      return start(param, newLogger)
    }

    newLogger.silly('started')

    return newLogger
  }

  var logger = loggerFactory()

  logger.start = function (param) {
    return start(param, logger)
  }

  return logger
}