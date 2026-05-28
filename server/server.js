
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import cors from "cors";

dotenv.config({ path: './.env' });

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const dashboardSchema = new mongoose.Schema(
  {
    welcome: {
      name: { type: String, required: true },
      matricNo: { type: String, required: true },
      level: { type: String, required: true },
      programme: { type: String, required: true },
      admissionType: { type: String, required: true },
      profileImage: { type: String, required: true },
    },
    complaints: {
      total: { type: Number, required: true },
      pending: { type: Number, required: true },
      resolved: { type: Number, required: true },
    },
    registration: {
      session: { type: String, required: true },
      status: { type: String, required: true },
      unitsRegistered: { type: Number, required: true },
      maxUnits: { type: Number, required: true },
    },
    clearance: {
      completed: { type: Number, required: true },
      total: { type: Number, required: true },
      items: [
        {
          label: { type: String, required: true },
          status: { type: String, required: true },
        },
      ],
    },
    semester: {
      label: { type: String, required: true },
      stage: { type: String, required: true },
      week: { type: Number, required: true },
      totalWeeks: { type: Number, required: true },
      examStarts: { type: String, required: true },
    },
    documents: {
      total: { type: Number, required: true },
      items: [
        {
          label: { type: String, required: true },
          status: { type: String, required: true },
        },
      ],
    },
    disciplinary: {
      status: { type: String, required: true },
      warnings: { type: Number, required: true },
      suspensionHistory: { type: String, required: true },
      standing: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const Dashboard = mongoose.model("Dashboard", dashboardSchema);

const defaultDashboard = {
  welcome: {
    name: "Diamond",
    matricNo: "2022/490",
    level: "Level 400",
    programme: "Software Engineering",
    admissionType: "UTME",
    profileImage: "https://via.placeholder.com/220",
  },
  complaints: {
    total: 4,
    pending: 2,
    resolved: 1,
  },
  registration: {
    session: "2025/26",
    status: "Approved",
    unitsRegistered: 21,
    maxUnits: 24,
  },
  clearance: {
    completed: 4,
    total: 6,
    items: [
      { label: "Library", status: "Done" },
      { label: "Bursary", status: "Pending" },
      { label: "HOD", status: "Pending" },
    ],
  },
  semester: {
    label: "2nd",
    stage: "400L",
    week: 4,
    totalWeeks: 12,
    examStarts: "May 12",
  },
  documents: {
    total: 2,
    items: [
      { label: "Transcript", status: "Processing" },
      { label: "Intro letter", status: "Ready" },
    ],
  },
  disciplinary: {
    status: "Clean",
    warnings: 0,
    suspensionHistory: "None",
    standing: "Good standing",
  },
};

async function seedDashboard() {
  const existing = await Dashboard.findOne();

  if (!existing) {
    await Dashboard.create(defaultDashboard);
    console.log("Seeded default dashboard data");
  }
}

app.get("/api/dashboard", async (_req, res) => {
  try {
    const dashboard = await Dashboard.findOne().lean();

    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard data not found" });
    }

    res.json(dashboard);
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    await seedDashboard();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });           