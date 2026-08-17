import express from "express";
import Request from "../models/Request.js";
import protect from "../middleware/protect.js";

const router = express.Router();

// CREATE a new resource request
// POST /api/requests
router.post("/", async (req, res) => {
  try {
    const newRequest = await Request.create(req.body);
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// LIST all requests, including full shelter details for each one
// GET /api/requests
router.get("/", async (req, res) => {
  try {
    const requests = await Request.find().populate("shelter");
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE request status (e.g. mark as fulfilled)
// PUT /api/requests/:id/status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "fulfilled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("shelter");

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a request (protected - only the shelter's admin can delete)
// DELETE /api/requests/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate("shelter");
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Verify that the logged-in admin owns the shelter this request belongs to
    if (request.shelter.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete requests for this shelter" });
    }

    await Request.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;