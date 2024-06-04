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
  budget: { type: String, required: true },
  date_added: { type: Date, required: true, default: Date.now },
  createdBy: { type: String, required: true },
  updateby: { type: String },
  updateDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false },
});

/*

objectivesSchema.pre("save", async function () {
  const goal = await mongoose.model("Goals").findById(this.goal_Id);
  if (!goal) {
    throw new Error("Invalid goal ID provided");
  }
  goal.objectives.push(this._id); // Add objective ID to the goal's objectives array
  await goal.save();

});

*/

module.exports = mongoose.model("Objective", objectivesSchema);

/*

const mongoose = require("mongoose");

const { Schema } = mongoose;

const objectivesSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: {
    type: String,
    required: true,
    lowercase: true,
  },
  goalId: { type: String, required: true },
  functional_objective: { type: String },
  performance_indicator: { type: String },
  target: { type: String },
  formula: { type: String },
  programs: { type: String },
  responsible_persons: { type: String, required: true },
  clients: { type: String },
  timetable: [],
  frequency_monitoring: { type: String },
  data_source: { type: String },
  budget: { type: String, required: true },
  date_added: { type: Date, required: true, default: Date.now },
  createdBy: { type: String, required: true },
  updateby: { type: String },
  updateDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("Objectives", objectivesSchema);


{
  "id": "1",
  "department": "ict",
  "user": "john.doe",
  "strategic_objective": "Increase productivity",
  "functional_objective": "Implement new software",
  "performance_indicator": "Number of lines of code",
  "target": "1000",
  "formula": "lines of code / hours",
  "programs": "Implement new software",
  "responsible_persons": "John Doe",
  "clients": "Chmsu",
  "timetable": "1 month",
  "frequency_monitoring": "Monthly",
  "data_source": "Git commits",
  "budget": "1000",
  "createdBy": "admin",
  "updateby": "admin",
  "status": "active",
};

*/
