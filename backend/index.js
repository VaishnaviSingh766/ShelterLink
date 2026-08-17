import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import shelterRoutes from "./routes/shelterRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error);
  });

app.get("/", (req, res) => {
  res.send("ShelterLink backend is running!");
});

app.use("/api/shelters", shelterRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});