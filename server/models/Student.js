import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matricNo: { type: String, required: true },
  name: { type: String, required: true },
  batch: { type: String, required: true },
  degree: { type: String, required: true },
  currentSemester: { type: Number, required: true },
  creditsCompleted: { type: Number, default: 0 },
  creditsRequired: { type: Number, default: 120 },
  cgpa: { type: Number, default: 0.00 }
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
