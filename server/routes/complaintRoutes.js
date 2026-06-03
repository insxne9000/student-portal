import express from 'express';
import { getComplaints, createComplaint } from '../controllers/complaintController.js';

const router = express.Router();

// Middleware to mock/ensure student auth
router.use((req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ message: "Student access required." });
  }
  next();
});

router.get('/', getComplaints);
router.post('/', createComplaint);

export default router;
