import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
app.use(express.static(path.join(__dirname, "public")));

// ✅ MongoDB Connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Error:", err));

// ✅ Schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String
});

const CraneSchema = new mongoose.Schema({
  craneId: String,
  craneModel: String,
  errorCode: String,
  errorDescription: String,
  severity: String,
  lastMaintenance: String,
  steps: [Object],
  createdAt: { type: Date, default: Date.now }
});

// ✅ Models (note: mongoose automatically plural banata hai, so users & cranes)
const User = mongoose.model("User", UserSchema, "users");
const Crane = mongoose.model("Crane", CraneSchema, "cranes");

// ✅ Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: "⚠ User already exists" });

    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: "✅ Registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "❌ Server error during signup" });
  }
});

// ✅ Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ message: "❌ Invalid credentials" });

    res.status(200).json({ message: "✅ Login successful" });
  } catch (err) {
    res.status(500).json({ message: "❌ Server error during login" });
  }
});

// ✅ Save Crane Data (add manually via form)
app.post("/api/crane", async (req, res) => {
  try {
    const crane = new Crane(req.body);
    await crane.save();
    res.status(201).json({ message: "✅ Crane data saved" });
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to save crane data" });
  }
});

// ✅ Fetch Crane Data by craneId OR errorCode
app.get("/api/crane/:code", async (req, res) => {
  try {
    const query = { 
      $or: [
        { craneId: req.params.code }, 
        { errorCode: req.params.code }
      ] 
    };

    const crane = await Crane.findOne(query);

    if (!crane) {
      return res.status(404).json({ message: "❌ No data found for this ID or Error Code" });
    }

    res.status(200).json(crane);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching crane data" });
  }
});

// ✅ Get All Cranes (for dashboard/reports)
app.get("/api/cranes", async (req, res) => {
  try {
    const cranes = await Crane.find();
    res.status(200).json(cranes);
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to fetch cranes list" });
  }
});

// ✅ Start Server
app.listen(PORT, () => console.log(🚀 Server running on port ${PORT}));
