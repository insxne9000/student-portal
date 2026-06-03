import Student from '../models/Student.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Invoice from '../models/Invoice.js';

// Helper to get Student from the mocked Auth User
const getStudentFromAuth = async (userId) => {
  return await Student.findOne({ userId });
};

export const viewEnrollment = async (req, res) => {
  try {
    const { semester } = req.params;
    const userId = req.user.userId;

    const student = await getStudentFromAuth(userId);
    if (!student) return res.status(404).json({ message: "Student profile not found." });

    const enrollment = await Enrollment.findOne({ studentId: student._id, semester: Number(semester) })
      .populate('recommendedCourses', 'courseCode title credits fee')
      .populate('selectedCourses', 'courseCode title credits fee');

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found for this semester." });
    }

    res.json(enrollment);
  } catch (error) {
    console.error("Error in viewEnrollment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addDropCourses = async (req, res) => {
  try {
    const { semester } = req.params;
    const { selectedCourseIds } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(selectedCourseIds)) {
      return res.status(400).json({ message: "selectedCourseIds must be an array." });
    }

    const student = await getStudentFromAuth(userId);
    if (!student) return res.status(404).json({ message: "Student profile not found." });

    const enrollment = await Enrollment.findOne({ studentId: student._id, semester: Number(semester) });
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found for this semester." });
    }

    if (enrollment.status === 'locked') {
      return res.status(403).json({ message: "Cannot modify locked enrollment." });
    }

    enrollment.selectedCourses = selectedCourseIds;
    await enrollment.save();

    res.json({ message: "Courses updated successfully.", enrollment });
  } catch (error) {
    console.error("Error in addDropCourses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkout = async (req, res) => {
  try {
    const { semester } = req.params;
    const { selectedCourseIds } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(selectedCourseIds) || selectedCourseIds.length === 0) {
      return res.status(400).json({ message: "You must select at least one course." });
    }

    const student = await getStudentFromAuth(userId);
    if (!student) return res.status(404).json({ message: "Student profile not found." });

    // Fetch the full course details
    const selectedCourses = await Course.find({ _id: { $in: selectedCourseIds } });

    // Upsert Enrollment
    const enrollment = await Enrollment.findOneAndUpdate(
      { studentId: student._id, semester: Number(semester) },
      { 
        status: 'locked', 
        selectedCourses: selectedCourseIds,
        recommendedCourses: selectedCourseIds // Fallback
      },
      { upsert: true, new: true }
    );

    // Hardcode: 10,000 Nairas per course as requested by user
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

    // Generate Invoice
    const invoice = new Invoice({
      studentId: student._id,
      enrollmentId: enrollment._id,
      semester: Number(semester),
      status: 'pending',
      lineItems,
      totalAmountDue
    });

    await invoice.save();

    res.status(201).json({ message: "Checkout successful. Invoice generated.", invoice });
  } catch (error) {
    console.error("Error in checkout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

import Grade from '../models/Grade.js';

export const getStudentResults = async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await getStudentFromAuth(userId);
    if (!student) return res.status(404).json({ message: "Student profile not found." });

    // Check payment lock: If the student has any 'pending' invoices, lock results
    const pendingInvoice = await Invoice.findOne({ studentId: student._id, status: 'pending' });
    
    if (pendingInvoice) {
      return res.json({ 
        locked: true, 
        message: "Your results are withheld pending payment approval from the administration." 
      });
    }

    const grades = await Grade.find({ studentId: student._id })
      .populate('courseId', 'courseCode title credits')
      .lean();

    res.json({ locked: false, grades });
  } catch (error) {
    console.error("Error in getStudentResults:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await getStudentFromAuth(userId);
    if (!student) return res.status(404).json({ message: "Student profile not found." });

    const invoices = await Invoice.find({ studentId: student._id }).sort({ createdAt: -1 }).lean();
    res.json({ invoices });
  } catch (error) {
    console.error("Error in getInvoices:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
