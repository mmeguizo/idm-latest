const mongoose = require("mongoose");
let bcrypt = require("bcryptjs");
const email = require("./validators/user-validators");
const username = require("./validators/user-validators");
const password = require("./validators/user-validators");
const { Schema } = mongoose;

const fileUpload = new Schema(
  {
    id: { type: String, required: true },
    source: { type: String, maxlength: 50, required: true },
    user_id: { type: String, required: true },
    for: { type: String, maxlength: 50, required: true },
    date_added: {
      type: Date,
      default: () => new Date(), // <--- new date nodejs less than one day local ph  time
    },
    status: { type: Boolean, default: true },
    filetype: { type: String, default: "" },
    objective_id: { type: String, required: true },
    // added_by:           { type:Number, maxlength:7, required:true },

    // needed for file updload in objectives
    file_month_0: { type: String },
    file_month_1: { type: String },
    file_month_2: { type: String },
    file_month_3: { type: String },
    file_month_4: { type: String },
    file_month_5: { type: String },
    file_month_6: { type: String },
    file_month_7: { type: String },
    file_month_8: { type: String },
    file_month_9: { type: String },
    file_month_10: { type: String },
    file_month_11: { type: String },

    file_quarter_1: { type: String },
    file_quarter_2: { type: String },
    file_quarter_3: { type: String },
    file_quarter_0: { type: String },

    file_semi_annual_0: { type: String },
    file_semi_annual_1: { type: String },
    file_semi_annual_2: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("File", fileUpload);
