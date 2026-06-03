import Complaint from '../models/Complaint.js';
import Student from '../models/Student.js';

// Helper to get Student from the mocked Auth User
const getStudentFromAuth = async (userId) => {
  return await Student.findOne({ userId });
};

// Generate random ticket ID like HA2tju4XDV
const generateTicketId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const getComplaints = async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await getStudentFromAuth(userId);
    if (!student) return res.status(404).json({ message: "Student profile not found." });

    const complaints = await Complaint.find({ studentId: student._id }).sort({ createdAt: -1 }).lean();
    
    const summary = {
      total: complaints.length,
      answered: complaints.filter(c => c.status === 'answered').length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
      pending: complaints.filter(c => c.status === 'pending').length,
    };

    res.json({ complaints, summary });
  } catch (error) {
    console.error("Failed to fetch complaints:", error);
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
};

export const createComplaint = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required." });
    }

    const userId = req.user.userId;
    const student = await getStudentFromAuth(userId);
    if (!student) return res.status(404).json({ message: "Student profile not found." });

    const ticketId = generateTicketId();

    const newComplaint = new Complaint({
      studentId: student._id,
      ticketId,
      title,
      description,
      status: 'pending'
    });

    await newComplaint.save();

    res.status(201).json({ message: "Complaint created successfully", complaint: newComplaint });
  } catch (error) {
    console.error("Failed to create complaint:", error);
    res.status(500).json({ message: "Failed to create complaint" });
  }
};

// Admin endpoint to resolve a complaint
export const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if admin (this relies on the auth middleware checking req.user.role)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required." });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id, 
      { status: 'resolved' },
      { new: true }
    );

    if (!complaint) return res.status(404).json({ message: "Complaint not found." });

    res.json({ message: "Complaint resolved", complaint });
  } catch (error) {
    console.error("Failed to resolve complaint:", error);
    res.status(500).json({ message: "Failed to resolve complaint" });
  }
};
