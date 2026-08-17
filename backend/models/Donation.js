import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  shelter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shelter",
    required: true,
  },
  donorName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["completed", "failed"],
    default: "completed",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Donation = mongoose.model("Donation", donationSchema);

export default Donation;
