const mongoose = require("mongoose");
const { Schema } = mongoose;

const logs = new Schema(
  {
    params: {},
    query: {},
    url: {},
    body: {},
    status: {},
    duration: {},
    date: {},
    statusCode: {},
    ip: {},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Logs", logs);

/*

method: req.method,
      params: req.params,
      query: req.query,
      url: req.originalUrl,
      body: req.body,
      status: res.statusCode,
      duration: `${duration}ms`,
      date: Date.now(),
      statusCode: res.statusCode,
      ip: req.socket.remoteAddress,

*/