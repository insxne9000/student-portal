import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  ticketId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  adminResponse: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'answered', 'resolved'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model('Complaint', complaintSchema);
