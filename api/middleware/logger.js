const winston = require("winston");
require("winston-mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const config = require("../config/database");

const logs = require("../models/logs");

// Logger configuration
// const logger = winston.createLogger({
//   level: "info",
//   format: winston.format.json(),
//   transports: [
//     new winston.transports.MongoDB({
//       db: process.env.DB_URL,
//       collection: "logHistory",
//       options: { useUnifiedTopology: true, useNewUrlParser: true },
//       storeHost: true,
//     }),
//   ],
// });
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.MongoDB({
      level: 'info',
      db: process.env.DB_URL,
      collection: 'logHistory',
      // options: {
      //   useUnifiedTopology: true
      // },
      storeHost: true,
      metaKey: 'metadata',
      expireAfterSeconds: 2592000 // Optional: logs expire after 30 days
    })
  ]
});

// Logging middleware
// async function logMiddleware(data) {
//   if (data) {
//     await logs.create(data);
//   }
// }

const logMiddleware = async (req, res, next) => {
  try {
    if (req.method !== 'OPTIONS') {
      await logs.create({
        method: req.method,
        url: req.url,
        body: req.body,
        timestamp: new Date(),
        ip: req.ip
      });
    }
  } catch (error) {
    console.error('Logging error:', error);
  }
  if (typeof next === 'function') {
    next();
  }
};

module.exports = { logger, logMiddleware };
