import mongoose from 'mongoose';

// Kept remarks for frontend compatibility, added degree and fee as requested.
const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true },
  title: { type: String, required: true },
  credits: { type: Number, required: true },
  degree: { type: String, required: true, default: "Computer Science" },
  fee: { type: Number, required: true, default: 0 },
  remarks: { type: String, default: "Core" },
  level: { type: Number, required: true },
  semester: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
