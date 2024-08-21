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

// Logging middleware
async function logMiddleware({ data }) {
  if (data) {
    await logs.create(data);
  }
  // const startTime = Date.now();
  // const duration = Date.now() - startTime;
  // const data = {
  //   method: req.method,
  //   params: req.params,
  //   query: req.query,
  //   url: req.originalUrl,
  //   body: req.body,
  //   status: res.statusCode,
  //   duration: `${duration}ms`,
  //   date: Date.now(),
  //   user: { username, id, role, profile_pic, campus, department },
  // };

  // await logs.create(data);
  // logger.info("HTTP Request", data);
  //   const startTime = Date.now();
  //   // Extract the token from the Authorization header
  //   const authHeader = req.headers["authorization"];
  //   if (authHeader) {
  //     test = jwt.verify(authHeader, config.secret);

  //     console.log({ logMiddleware: test });

  //     const { username, id, role, profile_pic, campus, department } = jwt.verify(
  //       authHeader,
  //       config.secret
  //     );
  //     res.on("finish", async () => {
  //       const duration = Date.now() - startTime;
  //       const data = {
  //         method: req.method,
  //         params: req.params,
  //         query: req.query,
  //         url: req.originalUrl,
  //         body: req.body,
  //         status: res.statusCode,
  //         duration: `${duration}ms`,
  //         date: Date.now(),
  //         user: { username, id, role, profile_pic, campus, department },
  //       };
  //       await logs.create(data);
  //       logger.info("HTTP Request", data);
  //     });

  //   }
  //   //next routes
  // next();
}

module.exports = { logger, logMiddleware };
