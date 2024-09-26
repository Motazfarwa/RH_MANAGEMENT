const { Schema } = require("mongoose");
const mongoose = require("mongoose")

const DocumentRequestSchema = new mongoose.Schema({
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    document_type: { type: String, required: true },
    status: { type: String, default: "Pending" },
    file_path: { type: String },
    request_date: { type: Date, default: Date.now },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    approvedAt: {
      type: Date,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  });
  
  module.exports.DocumentRequest= mongoose.model("DocumentRequest",DocumentRequestSchema)