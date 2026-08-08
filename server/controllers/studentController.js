import Student from '../models/Student.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Invoice from '../models/Invoice.js';
import Grade from '../models/Grade.js';
import Complaint from '../models/Complaint.js';
import Dashboard from '../models/Dashboard.js';

// Helper to get Student from the mocked Auth User
const getStudentFromAuth = async (userId) => {
  return await Student.findOne({ userId });
};

const initializeGradesForInvoice = async (studentId, invoice) => {
  const enrollment = await Enrollment.findById(invoice.enrollmentId);
  if (!enrollment || !enrollment.selectedCourses) return;

  const semesterLabel = `Year ${Math.ceil(invoice.semester / 2)} - ${invoice.semester % 2 === 0 ? '2nd' : '1st'} Sem`;

  for (const courseId of enrollment.selectedCourses) {
    const existingGrade = await Grade.findOne({ studentId, courseId, semesterLabel });
    if (!existingGrade) {
      await Grade.create({
        studentId,
        courseId,
        semesterLabel,
        classesAttended: 0,
        totalClasses: 0,
        released: false,
      });
    }
  }
};

export const viewEnrollment = async (req, res) => {
  try {
    const { semester } = req.params;
    const userId = req.user.userId;

    const student = await getStudentFromAuth(userId);
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const enrollment = await Enrollment.findOne({ studentId: student._id, semester: Number(semester) })
      .populate('recommendedCourses', 'courseCode title credits fee')
      .populate('selectedCourses', 'courseCode title credits fee');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found for this semester.' });
    }

    res.json(enrollment);
  } catch (error) {
    console.error('Error in viewEnrollment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addDropCourses = async (req, res) => {
  try {
    const { semester } = req.params;
    const { selectedCourseIds } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(selectedCourseIds)) {
      return res.status(400).json({ message: 'selectedCourseIds must be an array.' });
    }

    const student = await getStudentFromAuth(userId);
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const enrollment = await Enrollment.findOne({ studentId: student._id, semester: Number(semester) });
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found for this semester.' });
    }

    if (enrollment.status === 'locked') {
      return res.status(403).json({ message: 'Cannot modify locked enrollment.' });
    }

    enrollment.selectedCourses = selectedCourseIds;
    await enrollment.save();

    res.json({ message: 'Courses updated successfully.', enrollment });
  } catch (error) {
    console.error('Error in addDropCourses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const checkout = async (req, res) => {
  try {
    const { semester } = req.params;
    const { selectedCourseIds } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(selectedCourseIds) || selectedCourseIds.length === 0) {
      return res.status(400).json({ message: 'You must select at least one course.' });
    }

    const student = await getStudentFromAuth(userId);
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const selectedCourses = await Course.find({ _id: { $in: selectedCourseIds } });

    const enrollment = await Enrollment.findOneAndUpdate(
      { studentId: student._id, semester: Number(semester) },
      {
        status: 'locked',
        selectedCourses: selectedCourseIds,
        recommendedCourses: selectedCourseIds
      },
      { upsert: true, new: true }
    );

    const FEE_PER_COURSE = 10000;
    let totalAmountDue = 0;
    const lineItems = [];

    for (const course of selectedCourses) {
      lineItems.push({
        courseCode: course.courseCode,
        amount: FEE_PER_COURSE
      });
      totalAmountDue += FEE_PER_COURSE;
    }

    const invoice = new Invoice({
      studentId: student._id,
      enrollmentId: enrollment._id,
      semester: Number(semester),
      status: 'pending',
      lineItems,
      totalAmountDue,
      amountPaid: 0,
      paymentHistory: []
    });

    await invoice.save();

    res.status(201).json({ message: 'Checkout successful. Invoice generated.', invoice });
  } catch (error) {
    console.error('Error in checkout:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudentResults = async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await getStudentFromAuth(userId);
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const unpaidInvoice = await Invoice.findOne({
      studentId: student._id,
      status: { $in: ['pending', 'partially_paid'] }
    });

    if (unpaidInvoice) {
      return res.json({
        locked: true,
        message: 'Your results are withheld pending full payment/approval from the administration.'
      });
    }

    let grades = await Grade.find({ studentId: student._id })
      .populate('courseId', 'courseCode title credits')
      .lean();

    // If payment has been completed but no grade placeholders exist,
    // initialize them automatically from paid invoices
    if (grades.length === 0) {
      const paidInvoices = await Invoice.find({
        studentId: student._id,
        status: 'paid'
      }).lean();

      if (paidInvoices.length > 0) {
        for (const invoice of paidInvoices) {
          await initializeGradesForInvoice(student._id, invoice);
        }

        grades = await Grade.find({ studentId: student._id })
          .populate('courseId', 'courseCode title credits')
          .lean();
      }
    }

    res.json({ locked: false, grades });
  } catch (error) {
    console.error('Error in getStudentResults:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudentAttendance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await getStudentFromAuth(userId);
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const grades = await Grade.find({ studentId: student._id })
      .populate('courseId', 'courseCode title credits')
      .lean();

    res.json({ grades, demo: grades.length === 0 });
  } catch (error) {
    console.error('Error in getStudentAttendance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await getStudentFromAuth(userId);
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const invoices = await Invoice.find({ studentId: student._id }).sort({ createdAt: -1 }).lean();
    res.json({ invoices });
  } catch (error) {
    console.error('Error in getInvoices:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const recordInvoicePayment = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { amount } = req.body;
    const userId = req.user.userId;

    const student = await getStudentFromAuth(userId);
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: 'A valid payment amount is required.' });
    }

    const invoice = await Invoice.findOne({ _id: invoiceId, studentId: student._id });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });

    const remaining = Math.max(invoice.totalAmountDue - (invoice.amountPaid || 0), 0);
    if (numericAmount > remaining) {
      return res.status(400).json({ message: 'Entered amount is greater than the outstanding balance.' });
    }

    invoice.amountPaid = (invoice.amountPaid || 0) + numericAmount;
    invoice.paymentHistory.push({ amount: numericAmount, paidAt: new Date() });

    if (invoice.amountPaid >= invoice.totalAmountDue) {
      invoice.amountPaid = invoice.totalAmountDue;
      invoice.status = 'paid';
      await invoice.save();
      await initializeGradesForInvoice(student._id, invoice);
    } else {
      invoice.status = 'partially_paid';
      await invoice.save();
    }

    res.json({
      message: invoice.status === 'paid' ? 'Payment completed successfully.' : 'Payment recorded successfully.',
      invoice
    });
  } catch (error) {
    console.error('Error in recordInvoicePayment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudentClearance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await getStudentFromAuth(userId);
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const dashboard = await Dashboard.findOne({ studentId: student._id }).lean();
    if (!dashboard) return res.status(404).json({ message: 'Dashboard data not found.' });

    res.json({
      session: dashboard.registration?.session || '2025/2026',
      student: {
        name: dashboard.welcome?.name,
        matricNo: dashboard.welcome?.matricNo,
        programme: dashboard.welcome?.programme,
      },
      clearance: dashboard.clearance || { completed: 0, total: 0, items: [] }
    });
  } catch (error) {
    console.error('Error in getStudentClearance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudentNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await getStudentFromAuth(userId);
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const [invoices, complaints, grades] = await Promise.all([
      Invoice.find({ studentId: student._id }).lean(),
      Complaint.find({ studentId: student._id }).lean(),
      Grade.find({ studentId: student._id }).lean(),
    ]);

    const notifications = [];

    invoices.forEach((invoice) => {
      if (Array.isArray(invoice.paymentHistory) && invoice.paymentHistory.length > 0) {
        invoice.paymentHistory.forEach((payment, index) => {
          notifications.push({
            id: `pay-${invoice._id}-${index}`,
            type: invoice.status === 'paid' ? 'success' : 'info',
            category: 'payment',
            title: invoice.status === 'paid' ? 'Payment Confirmed' : 'Payment Recorded',
            message: invoice.status === 'paid'
              ? `Your semester ${invoice.semester} payment has been fully completed.`
              : `A payment of ₦${payment.amount.toLocaleString()} has been recorded for semester ${invoice.semester}.`,
            createdAt: payment.paidAt || invoice.updatedAt || invoice.createdAt,
          });
        });
      }
    });

    complaints
      .filter((complaint) => ['answered', 'resolved'].includes(complaint.status))
      .forEach((complaint) => {
        notifications.push({
          id: `complaint-${complaint._id}`,
          type: complaint.status === 'resolved' ? 'success' : 'info',
          category: 'complaint',
          title: complaint.status === 'resolved' ? 'Complaint Resolved' : 'Complaint Updated',
          message: complaint.status === 'resolved'
            ? `Your complaint titled “${complaint.title}” has been resolved.`
            : `Your complaint titled “${complaint.title}” has been answered by the administration.`,
          createdAt: complaint.updatedAt || complaint.createdAt,
        });
      });

    const releasedGrades = grades.filter((grade) => grade.released && grade.score !== undefined);
    if (releasedGrades.length > 0) {
      notifications.push({
        id: 'result-release',
        type: 'success',
        category: 'result',
        title: 'Result Released',
        message: 'Your approved result is now available for viewing and download on the portal.',
        createdAt: releasedGrades.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0].updatedAt,
      });
    }

    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ notifications });
  } catch (error) {
    console.error('Error in getStudentNotifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
