import express from 'express';
import { 
  recommendCourses, 
  getAllStudents, 
  getStudentDetails, 
  uploadGrade, 
  approvePayment, 
  clearComplaint, 
  promoteSemester,
  getAllComplaints,
  answerComplaint,
  getAllInvoices,
  getAllClearances,
  updateStudentClearance,
  addCourse
} from '../controllers/adminController.js';
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

// Global Admin Management Routes
router.get('/complaints', getAllComplaints);
router.put('/complaints/:complaintId/answer', answerComplaint);
router.get('/invoices', getAllInvoices);
router.get('/clearances', getAllClearances);
router.put('/students/:id/clearance', updateStudentClearance);
router.post('/courses', addCourse);

// Admin Student Registry Routes
router.get('/students', getAllStudents);
router.get('/students/:id', getStudentDetails);
router.post('/students/:id/grades/:gradeId', uploadGrade);
router.post('/students/:id/promote', promoteSemester);
router.put('/students/:id/payment/:invoiceId', approvePayment);
router.put('/students/:id/complaint/:complaintId', clearComplaint);

export default router;
