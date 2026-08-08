import express from 'express';
import {
  viewEnrollment,
  addDropCourses,
  checkout,
  getStudentResults,
  getInvoices,
  recordInvoicePayment,
  getStudentAttendance,
  getStudentClearance,
  getStudentNotifications,
} from '../controllers/studentController.js';

const router = express.Router();

// Middleware to mock/ensure student auth
router.use((req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ message: 'Student access required.' });
  }
  next();
});

router.get('/enrollment/:semester', viewEnrollment);
router.put('/enrollment/:semester/courses', addDropCourses);
router.post('/enrollment/:semester/checkout', checkout);
router.get('/results', getStudentResults);
router.get('/attendance', getStudentAttendance);
router.get('/invoices', getInvoices);
router.post('/invoices/:invoiceId/pay', recordInvoicePayment);
router.get('/clearance', getStudentClearance);
router.get('/notifications', getStudentNotifications);

export default router;
