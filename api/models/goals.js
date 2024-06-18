const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { Schema } = mongoose;

const goalsSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    goals: { type: String, required: true, lowercase: true },
    campus: { type: String, required: true },
    budget: { type: Number, required: true },
    objectives: [],
    date_added: { type: Date, required: true, default: Date.now },
    createdBy: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedBy: { type: String },
    updateDate: { type: Date },
    complete: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Export the Goals model
module.exports = mongoose.model("Goals", goalsSchema);
