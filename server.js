import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Error:", err));

// Define Schemas
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});
const CraneSchema = new mongoose.Schema({
  craneId: String,
  craneModel: String,
  errorCode: String,
  errorDescription: String,
  severity: String,
  lastMaintenance: String,
  steps: [Object]
});

const User = mongoose.model("User", UserSchema);
const Crane = mongoose.model("Crane", CraneSchema);

// Middleware
app.use(bodyParser.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Save Crane Data
app.post("/api/crane", async (req, res) => {
  try {
    const crane = new Crane(req.body);
    await crane.save();
    res.status(201).json({ message: "Crane data saved" });
  } catch (err) {
    res.status(500).json({ message: "Failed to save crane data" });
  }
});

// Get Crane Data by ID
app.get("/api/crane/:id", async (req, res) => {
  try {
    const crane = await Crane.findOne({ craneId: req.params.id });
    if (!crane) return res.status(404).json({ message: "Crane not found" });
    res.status(200).json(crane);
  } catch (err) {
    res.status(500).json({ message: "Error fetching crane data" });
  }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
