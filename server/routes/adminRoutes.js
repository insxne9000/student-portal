import express from 'express';
import { recommendCourses, getAllStudents, getStudentDetails, uploadGrade, approvePayment, clearComplaint, promoteSemester } from '../controllers/adminController.js';
import { resolveComplaint } from '../controllers/complaintController.js';

const router = express.Router();

// Middleware to mock/ensure admin auth
router.use((req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
});

router.post('/recommend-courses', recommendCourses);
router.put('/complaints/:id/status', resolveComplaint);

// Admin Portal Routes
router.get('/students', getAllStudents);
router.get('/students/:id', getStudentDetails);
router.post('/students/:id/grades/:gradeId', uploadGrade);
router.post('/students/:id/promote', promoteSemester);
router.put('/students/:id/payment/:invoiceId', approvePayment);
router.put('/students/:id/complaint/:complaintId', clearComplaint);

export default router;
