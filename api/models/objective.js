const mongoose = require("mongoose");
const objectivesSchema = new mongoose.Schema({
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
  target: { type: String },
  formula: { type: String },
  programs: { type: String },
  responsible_persons: { type: String, required: true },
  clients: { type: String },
  timetable: [],
  frequency_monitoring: { type: String },
  complete: { type: Boolean, default: false },
  data_source: { type: String },
  budget: { type: Number, required: true },
  campus: { type: String, required: true },
  date_added: { type: Date, required: true, default: Date.now },
  createdBy: { type: String, required: true },
  updateby: { type: String },
  updateDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("Objective", objectivesSchema);
