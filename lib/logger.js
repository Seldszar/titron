const { pick, toUpper } = require('lodash');
const fs = require('fs-plus');
const winston = require('winston');

function stringify(info, space = '', ignored = []) {
  const replacer = (key, value) => {
    if (ignored.includes(key)) {
      return undefined;
    }

    if (value instanceof Error) {
      return pick(value, Object.getOwnPropertyNames(value));
    }

    return value;
  };

  return JSON.stringify(info, replacer, space);
}

function createLogger() {
  fs.makeTreeSync('data/logs');

  const logger = winston.createLogger({
    transports: [
      new winston.transports.File({
        filename: `data/logs/${Date.now()}.log`,
        handleExceptions: true,
        level: 'silly',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.splat(),
          winston.format.printf(stringify),
        ),
      }),
      new winston.transports.Console({
        handleExceptions: true,
        level: 'debug',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.splat(),
          winston.format.printf(info => `[${info.timestamp}] ${toUpper(info.level)}: ${info.message}`),
        ),
      }),
    ],
  });

  process.on('unhandledRejection', (error) => {
    logger.error(error.message, { error });
  });

  return logger;
}

exports.createLogger = createLogger;
