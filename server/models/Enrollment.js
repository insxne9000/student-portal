import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  semester: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'locked'], default: 'draft' },
  recommendedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  selectedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
}, { timestamps: true });

export default mongoose.model('Enrollment', enrollmentSchema);
