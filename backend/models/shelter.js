import mongoose from "mongoose";
const shelterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  availableBeds: {
    type: Number,
    required: true,
    default: 0,
  },
  foodAvailable: {
    type: Boolean,
    default: false,
  },
  suppliesAvailable: {
    type: Boolean,
    default: false,
  },
  urgencyLevel: {
    type: Number,
    default: 1,
  },
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
const Shelter = mongoose.model("Shelter", shelterSchema);

export default Shelter;
