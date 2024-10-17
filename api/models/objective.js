const mongoose = require("mongoose");
const objectivesSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: {
      type: String,
      required: true,
      lowercase: true,
    },
    goalId: { type: String },
    goal_Id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Goals",
    },
    functional_objective: { type: String },
    performance_indicator: { type: String },
    target: { type: Number },
    formula: { type: String },
    programs: { type: String },
    responsible_persons: { type: String, required: true },
    clients: { type: String },
    remarks: { type: String },
    // timetable: [],
    // frequency_monitoring: { type: String },
    month_0: { type: Number },
    month_1: { type: Number },
    month_2: { type: Number },
    month_3: { type: Number },
    month_4: { type: Number },
    month_5: { type: Number },
    month_6: { type: Number },
    month_7: { type: Number },
    month_8: { type: Number },
    month_9: { type: Number },
    month_10: { type: Number },
    month_11: { type: Number },

    goal_month_0: { type: Number },
    goal_month_1: { type: Number },
    goal_month_2: { type: Number },
    goal_month_3: { type: Number },
    goal_month_4: { type: Number },
    goal_month_5: { type: Number },
    goal_month_6: { type: Number },
    goal_month_7: { type: Number },
    goal_month_8: { type: Number },
    goal_month_9: { type: Number },
    goal_month_10: { type: Number },
    goal_month_11: { type: Number },

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

    quarter_1: { type: Number },
    quarter_2: { type: Number },
    quarter_3: { type: Number },
    quarter_0: { type: Number },

    goal_quarter_1: { type: Number },
    goal_quarter_2: { type: Number },
    goal_quarter_3: { type: Number },
    goal_quarter_0: { type: Number },

    file_quarter_1: { type: String },
    file_quarter_2: { type: String },
    file_quarter_3: { type: String },
    file_quarter_0: { type: String },

    semi_annual_0: { type: Number },
    semi_annual_1: { type: Number },

    goal_semi_annual_0: { type: Number },
    goal_semi_annual_1: { type: Number },

    file_semi_annual_0: { type: String },
    file_semi_annual_1: { type: String },

    frequency_monitoring: {
      type: String,
      enum: ["yearly", "quarterly", "monthly", "semi_annual"], // Define allowed values
      // required: true,
    },
    timetable: {
      type: Map, // Use a Map to store month-value pairs
      of: Number, // Values will be numbers
      default: {}, // Initialize as an empty map
    },

    complete: { type: Boolean, default: false },
    data_source: { type: String },
    budget: { type: Number, required: true },
    // campus: { type: String, required: true },
    date_added: { type: Date, required: true, default: Date.now },
    createdBy: { type: String, required: true },
    updateby: { type: String },
    updateDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Objective", objectivesSchema);
