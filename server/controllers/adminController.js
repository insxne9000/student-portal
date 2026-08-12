import Student from '../models/Student.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Grade from '../models/Grade.js';
import Invoice from '../models/Invoice.js';
import Complaint from '../models/Complaint.js';
import Dashboard from '../models/Dashboard.js';

export const recommendCourses = async (req, res) => {
  try {
    const { batch, semester } = req.body;

    if (!batch || !semester) {
      return res.status(400).json({ message: "Batch and semester are required." });
    }

    const students = await Student.find({ batch });
    
    if (students.length === 0) {
      return res.status(404).json({ message: "No students found for this batch." });
    }

    const results = [];

    for (const student of students) {
      // Find relevant courses for their degree
      const recommendedCourses = await Course.find({ degree: student.degree });
      const courseIds = recommendedCourses.map(c => c._id);

      // Create new Enrollment draft
      const newEnrollment = new Enrollment({
        studentId: student._id,
        semester: semester,
        status: 'draft',
        recommendedCourses: courseIds,
        selectedCourses: [] // Initially empty
      });

      await newEnrollment.save();
      results.push(newEnrollment);
    }

    res.status(201).json({ 
      message: `Generated enrollments for ${results.length} students.`, 
      enrollments: results 
    });
  } catch (error) {
    console.error("Error in recommendCourses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().lean();
    
    // Group by batch (year)
    const grouped = students.reduce((acc, student) => {
      if (!acc[student.batch]) acc[student.batch] = [];
      acc[student.batch].push(student);
      return acc;
    }, {});
    
    res.json({ grouped });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStudentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id).lean();
    if (!student) return res.status(404).json({ message: "Student not found" });

    const grades = await Grade.find({ studentId: id }).populate('courseId').lean();
    const invoices = await Invoice.find({ studentId: id }).lean();
    const complaints = await Complaint.find({ studentId: id }).lean();

    res.json({ student, grades, invoices, complaints });
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadGrade = async (req, res) => {
  try {
    const { id, gradeId } = req.params;
    const { score, classesAttended, totalClasses } = req.body;

    const gradeDoc = await Grade.findById(gradeId).populate('courseId');
    if (!gradeDoc) return res.status(404).json({ message: "Grade record not found" });

    // Store old state for credit calculation
    const wasPassed = gradeDoc.passed;
    let isNowPassed = gradeDoc.passed;

    // Handle attendance update if provided
    if (classesAttended !== undefined) gradeDoc.classesAttended = Number(classesAttended);
    if (totalClasses !== undefined) gradeDoc.totalClasses = Number(totalClasses);

    // Calculate attendance percentage
    const attendancePercent = gradeDoc.totalClasses > 0 
      ? (gradeDoc.classesAttended / gradeDoc.totalClasses) 
      : 1; // Default to 1 (100%) if totalClasses is 0 (i.e. not yet recorded)

    // Handle score update if provided
    if (score !== undefined && score !== '') {
      const numericScore = Number(score);
      if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
        return res.status(400).json({ message: "Invalid score" });
      }

      let letterGrade = 'F';
      isNowPassed = false;

      if (numericScore >= 70) letterGrade = 'A';
      else if (numericScore >= 60) letterGrade = 'B';
      else if (numericScore >= 50) letterGrade = 'C';
      else if (numericScore >= 45) letterGrade = 'D';
      else if (numericScore >= 40) letterGrade = 'E';

      if (numericScore >= 40) isNowPassed = true;

      // Enforce 70% attendance rule
      if (attendancePercent < 0.70) {
        letterGrade = 'F';
        isNowPassed = false;
      }

      gradeDoc.score = numericScore;
      gradeDoc.grade = letterGrade;
      gradeDoc.passed = isNowPassed;
      gradeDoc.released = true;
    } else {
       // Re-evaluate existing grade if only attendance was updated
       if (gradeDoc.score !== undefined && attendancePercent < 0.70) {
         gradeDoc.grade = 'F';
         gradeDoc.passed = false;
         isNowPassed = false;
       }
    }

    await gradeDoc.save();

    // Update student credits if newly passed
    if (isNowPassed && !wasPassed) {
      await Student.findByIdAndUpdate(id, {
        $inc: { creditsCompleted: gradeDoc.courseId.credits }
      });
    }

    res.json({ message: "Grade updated successfully", grade: gradeDoc });
  } catch (error) {
    console.error("Error uploading grade:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const approvePayment = async (req, res) => {
  try {
    const { id, invoiceId } = req.params;
    const invoice = await Invoice.findOne({ _id: invoiceId, studentId: id });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    invoice.status = 'paid';
    invoice.amountPaid = invoice.totalAmountDue;
    if (!Array.isArray(invoice.paymentHistory)) invoice.paymentHistory = [];
    await invoice.save();

    // Generate Grade records for the newly paid courses if they don't exist
    const enrollment = await Enrollment.findById(invoice.enrollmentId);
    if (enrollment && enrollment.selectedCourses) {
      const semesterLabel = `Year ${Math.ceil(invoice.semester / 2)} - ${invoice.semester % 2 === 0 ? '2nd' : '1st'} Sem`;

      for (const courseId of enrollment.selectedCourses) {
        const existingGrade = await Grade.findOne({ studentId: id, courseId, semesterLabel });
        if (!existingGrade) {
          await Grade.create({
            studentId: id,
            courseId,
            semesterLabel,
            classesAttended: 0,
            totalClasses: 0,
            released: false,
          });
        }
      }
    }

    res.json({ message: "Payment approved and grades initialized", invoice });
  } catch (error) {
    console.error("Error approving payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const clearComplaint = async (req, res) => {
  try {
    const { id, complaintId } = req.params;
    const complaint = await Complaint.findOneAndUpdate(
      { _id: complaintId, studentId: id },
      { status: 'resolved' },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json({ message: "Complaint cleared", complaint });
  } catch (error) {
    console.error("Error clearing complaint:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getGradePoint = (letterGrade) => {
  switch (letterGrade) {
    case 'A': return 5;
    case 'B': return 4;
    case 'C': return 3;
    case 'D': return 2;
    case 'E': return 1;
    case 'F': return 0;
    default: return 0;
  }
};

export const promoteSemester = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Fetch all graded courses to calculate CGPA
    const allGrades = await Grade.find({ studentId: id }).populate('courseId');
    
    let totalGradePoints = 0;
    let totalCreditsAttempted = 0;
    let totalCreditsCompleted = 0;

    for (const g of allGrades) {
      if (g.score !== undefined && g.courseId) { // Only calculate for graded courses
        const credits = g.courseId.credits;
        totalCreditsAttempted += credits;
        totalGradePoints += (getGradePoint(g.grade) * credits);
        if (g.passed) {
          totalCreditsCompleted += credits;
        }
      }
    }

    const cgpa = totalCreditsAttempted > 0 ? (totalGradePoints / totalCreditsAttempted).toFixed(2) : 0.00;

    // Bump the semester
    student.currentSemester += 1;
    student.creditsCompleted = totalCreditsCompleted;
    student.cgpa = Number(cgpa);

    // Also update Dashboard level if needed (e.g., if passing semester 2, promote to Year 2 Level 200)
    if (student.currentSemester % 2 !== 0) { // e.g., 3 means start of Year 2
      const year = Math.ceil(student.currentSemester / 2);
      const newLevelStr = `Level ${year}00`;
      await Dashboard.findOneAndUpdate(
        { studentId: id },
        { 
          $set: { 
            "welcome.level": newLevelStr,
            "semester.label": "1st",
            "semester.stage": `${year}00L`
          } 
        }
      );
    } else {
      await Dashboard.findOneAndUpdate(
        { studentId: id },
        { 
          $set: { 
            "semester.label": "2nd"
          } 
        }
      );
    }

    await student.save();
    
    res.json({ message: "Semester cleared, CGPA updated, and student promoted.", student });
  } catch (error) {
    console.error("Error promoting semester:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('studentId', 'name matricNo degree')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ complaints });
  } catch (error) {
    console.error("Error fetching all complaints:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const answerComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { responseText, markResolved } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    if (responseText !== undefined) {
      complaint.adminResponse = responseText;
    }

    if (markResolved) {
      complaint.status = 'resolved';
    } else {
      complaint.status = 'answered';
    }

    await complaint.save();
    res.json({ message: "Complaint updated successfully", complaint });
  } catch (error) {
    console.error("Error answering complaint:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('studentId', 'name matricNo degree')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ invoices });
  } catch (error) {
    console.error("Error fetching all invoices:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllClearances = async (req, res) => {
  try {
    const dashboards = await Dashboard.find()
      .populate('studentId', 'name matricNo degree batch')
      .lean();
    
    const clearances = dashboards.map(d => ({
      dashboardId: d._id,
      student: d.studentId || { name: d.welcome?.name, matricNo: d.welcome?.matricNo, degree: d.welcome?.programme },
      studentId: d.studentId?._id || d.studentId,
      clearance: d.clearance || { completed: 0, total: 6, items: [] }
    }));

    res.json({ clearances });
  } catch (error) {
    console.error("Error fetching clearances:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateStudentClearance = async (req, res) => {
  try {
    const { id } = req.params; // studentId or dashboardId
    const { label, status } = req.body; // status: 'Approved' | 'Pending'

    let dashboard = await Dashboard.findOne({ studentId: id });
    if (!dashboard) {
      dashboard = await Dashboard.findById(id);
    }
    if (!dashboard) return res.status(404).json({ message: "Dashboard record not found" });

    if (!dashboard.clearance) {
      dashboard.clearance = { completed: 0, total: 6, items: [] };
    }

    const itemIndex = dashboard.clearance.items.findIndex(i => i.label.toLowerCase() === label.toLowerCase());
    if (itemIndex > -1) {
      dashboard.clearance.items[itemIndex].status = status;
    } else {
      dashboard.clearance.items.push({ label, status });
    }

    dashboard.clearance.completed = dashboard.clearance.items.filter(i => i.status === 'Approved').length;
    dashboard.clearance.total = dashboard.clearance.items.length;

    await dashboard.save();
    res.json({ message: "Clearance status updated", clearance: dashboard.clearance });
  } catch (error) {
    console.error("Error updating student clearance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addCourse = async (req, res) => {
  try {
    const { courseCode, title, credits, level, semester, remarks, degree, fee } = req.body;
    if (!courseCode || !title || !credits || !level || !semester) {
      return res.status(400).json({ message: "Missing required course fields." });
    }

    const newCourse = new Course({
      courseCode,
      title,
      credits: Number(credits),
      level: Number(level),
      semester: Number(semester),
      remarks: remarks || "Core",
      degree: degree || "Computer Science",
      fee: fee ? Number(fee) : 0
    });

    await newCourse.save();
    res.status(201).json({ message: "Course created successfully", course: newCourse });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

