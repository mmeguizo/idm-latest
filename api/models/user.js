const mongoose = require("mongoose");
let bcrypt = require("bcryptjs");
const email = require("../models/validators/user-validators");
const username = require("../models/validators/user-validators");
const password = require("../models/validators/user-validators");
const { Schema } = mongoose;

const userSchema = new Schema({
  id: { type: String, required: true, unique: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: email.emailValidator,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: username.usernameValidators,
  },
  department: { type: String, required: true, default: "ICT" },
  role: { type: String, default: "user" },
  status: { type: String, default: "pending" },
  deleted: { type: Boolean, default: false },
  password: {
    type: String,
    required: true,
    validate: password.passwordValidator,
  },
  profile_pic: { type: String, default: "no-photo.png" },
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  } else {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(this.password, salt, (err, hash) => {
        if (err) return next(err); // Ensure no errors
        this.password = hash; // Apply encryption to password
        next(err); // Exit middleware
      });
    });
  }
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password); // this return a promise
};

module.exports = mongoose.model("User", userSchema);
