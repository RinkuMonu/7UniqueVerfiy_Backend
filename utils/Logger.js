// utils/logger.js
const winston = require("winston");

const Logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// Log to console if not in production
if (process.env.NODE_ENV !== "production") {
  Logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = Logger;
