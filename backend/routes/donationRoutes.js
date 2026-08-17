import express from "express";
import Donation from "../models/Donation.js";
import Shelter from "../models/Shelter.js";
import protect from "../middleware/protect.js";

const router = express.Router();

// CREATE a donation
// POST /api/donations
router.post("/", async (req, res) => {
  try {
    const { shelter, donorName, amount, email } = req.body;

    if (!shelter || !donorName || !amount || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Donation amount must be greater than zero" });
    }

    // Create donation record - simulating card approval successfully
    const newDonation = await Donation.create({
      shelter,
      donorName,
      amount: Number(amount),
      email,
      paymentStatus: "completed"
    });

    res.status(201).json(newDonation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET donations for all shelters owned by the logged-in admin
// GET /api/donations/admin
router.get("/admin", protect, async (req, res) => {
  try {
    // 1. Find all shelters owned by this admin
    const shelters = await Shelter.find({ admin: req.user._id });
    const shelterIds = shelters.map((s) => s._id);

    // 2. Fetch donations made to these shelters
    const donations = await Donation.find({ shelter: { $in: shelterIds } })
      .populate("shelter")
      .sort({ createdAt: -1 });

    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
