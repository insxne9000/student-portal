import Dashboard from '../models/Dashboard.js';
import Student from '../models/Student.js';

export const getDashboard = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) return res.status(404).json({ message: "Student record not found" });

    const dashboard = await Dashboard.findOne({ studentId: student._id }).lean();
    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard data not found" });
    }

    // Inject dynamic student data into dashboard object
    dashboard.academicOverview = {
      cgpa: student.cgpa || 0,
      creditsCompleted: student.creditsCompleted || 0,
      creditsRequired: student.creditsRequired || 120
    };

    res.json(dashboard);
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};
