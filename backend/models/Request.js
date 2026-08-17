import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  // Which shelter this request belongs to
  shelter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shelter",
    required: true,
  },
  resourceType: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["pending", "fulfilled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Request = mongoose.model("Request", requestSchema);

export default Request;