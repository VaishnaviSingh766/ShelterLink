import express from "express";
import Shelter from "../models/Shelter.js";
import calculateDistance from "../utils/calculateDistance.js";
import protect from "../middleware/protect.js";

const router = express.Router();

// CREATE a new shelter - now protected, only logged-in admins can do this
router.post("/", protect, async (req, res) => {
  try {
    // Link this shelter to whichever admin created it
    const newShelter = await Shelter.create({
      ...req.body,
      admin: req.user._id,
    });
    res.status(201).json(newShelter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const shelters = await Shelter.find();
    res.status(200).json(shelters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/priority", async (req, res) => {
  try {
    const userLat = Number(req.query.lat);
    const userLng = Number(req.query.lng);

    const shelters = await Shelter.find();

    const sheltersWithScore = shelters.map((shelter) => {
      const distanceKm = calculateDistance(
        userLat,
        userLng,
        shelter.location.lat,
        shelter.location.lng
      );

      const bedsWeight = Math.max(50 - shelter.availableBeds, 0);
      const distanceWeight = Math.max(50 - distanceKm, 0);
      const urgencyWeight = shelter.urgencyLevel * 10;

      const priorityScore = urgencyWeight + bedsWeight + distanceWeight;

      return {
        ...shelter.toObject(),
        distanceKm: Math.round(distanceKm * 10) / 10,
        priorityScore: Math.round(priorityScore),
      };
    });

    sheltersWithScore.sort((a, b) => b.priorityScore - a.priorityScore);

    res.status(200).json(sheltersWithScore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET shelters managed by the logged-in admin
router.get("/admin", protect, async (req, res) => {
  try {
    const shelters = await Shelter.find({ admin: req.user._id });
    res.status(200).json(shelters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE shelter details
router.put("/:id", protect, async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);

    if (!shelter) {
      return res.status(404).json({ message: "Shelter not found" });
    }

    // Verify ownership
    if (shelter.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this shelter" });
    }

    const updatedShelter = await Shelter.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedShelter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE shelter
router.delete("/:id", protect, async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);

    if (!shelter) {
      return res.status(404).json({ message: "Shelter not found" });
    }

    // Verify ownership
    if (shelter.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this shelter" });
    }

    await Shelter.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Shelter deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;