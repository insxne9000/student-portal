import express from 'express';
import { viewEnrollment, addDropCourses, checkout, getStudentResults, getInvoices } from '../controllers/studentController.js';

const router = express.Router();

// Middleware to mock/ensure student auth
router.use((req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ message: "Student access required." });
  }
  next();
});

router.get('/enrollment/:semester', viewEnrollment);
router.put('/enrollment/:semester/courses', addDropCourses);
router.post('/enrollment/:semester/checkout', checkout);
router.get('/results', getStudentResults);
router.get('/invoices', getInvoices);

export default router;
