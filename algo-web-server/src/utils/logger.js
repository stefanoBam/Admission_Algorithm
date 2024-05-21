const { createLogger, format, transports } = require("winston");

// Creates a logger with structured output
const logger = createLogger({
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(
      (info) =>
        `${info.timestamp} ${info.level}: ${JSON.stringify(info.message)}`
    )
  ),
  transports: [new transports.Console({})],
});

module.exports = logger;
