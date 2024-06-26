const winston = require("winston");
require("winston-mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const config = require("../config/database");

const logs = require("../models/logs");
// Logger configuration
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.MongoDB({
      db: process.env.DB_URL,
      collection: "logHistory",
      options: { useUnifiedTopology: true },
      storeHost: true,
    }),
  ],
});

// logger.add(
//   new winston.transports.Console({
//     format: winston.format.combine(
//       winston.format.colorize(),
//       winston.format.splat()
//     ),
//   })
// );

// Logging middleware
const logMiddleware = async (req, res, next) => {
  const startTime = Date.now();
  // Extract the token from the Authorization header
  const authHeader = req.headers["authorization"];
  if (authHeader !== undefined) {
    res.on("finish", async () => {
      const duration = Date.now() - startTime;
      ({ username, id, role, profile_pic, campus, department } =
        await jwt.verify(authHeader, config.secret));
      const data = {
        method: req.method,
        params: req.params,
        query: req.query,
        url: req.originalUrl,
        body: req.body,
        status: res.statusCode,
        duration: `${duration}ms`,
        date: Date.now(),
        user: { username, id, role, profile_pic, campus, department },
      };
      await logs.create(data);
      logger.info("HTTP Request", data);
    });
  }

  next();
};

module.exports = { logger, logMiddleware };
