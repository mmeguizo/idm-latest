const winston = require("winston");
require("winston-mongodb");
require("dotenv").config();
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

  res.on("finish", async () => {
    const duration = Date.now() - startTime;
    const data = {
      method: req.method,
      params: req.params,
      query: req.query,
      url: req.originalUrl,
      body: req.body,
      status: res.statusCode,
      duration: `${duration}ms`,
      date: Date.now(),
    };
    await logs.create(data);
    logger.info("HTTP Request", data);
  });

  next();
};

module.exports = { logger, logMiddleware };
