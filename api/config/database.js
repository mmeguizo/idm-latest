require("dotenv").config();
const crypto = require("crypto");

const secret = "meguizo";

const hash = crypto.createHmac("sha256", secret).update("akeem").digest("hex");

module.exports = {
  uri: process.env.DB_CHMSU,
  secret: hash,
  options: {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  },
};

