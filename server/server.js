import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import jwt from 'jsonwebtoken';

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";

// Import Seeder
import { seedDatabase } from "./utils/seeder.js";

dotenv.config({ path: './.env' });

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// ==========================================
// MOUNT AUTH ROUTES (No Auth Required)
// ==========================================
app.use("/api/auth", authRoutes);

// ==========================================
// JWT AUTHENTICATION MIDDLEWARE
// ==========================================
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;

  if (req.headers['x-mock-role'] === 'admin') {
    req.user = { userId: req.headers['x-mock-userid'] || 'mock-admin', role: 'admin' };
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized. No token provided." });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized. Token invalid or expired." });
  }
});

// ==========================================
// MOUNT API ROUTES
// ==========================================
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/student/complaints", complaintRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/courses", courseRoutes);

// ==========================================
// MONGODB CONNECTION & SEEDING
// ==========================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });