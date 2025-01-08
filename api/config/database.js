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
//mongodb+srv://markmeguizo:4ir5N9_csnLYViL@chmsu-web-apps.28chvga.mongodb.net/?retryWrites=true&w=majority&appName=chmsu-web-apps
