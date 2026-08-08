import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  semesterLabel: { type: String, required: true }, // e.g. "Year 1 - 1st Sem"
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E', 'F']
  },
  passed: {
    type: Boolean,
    default: false
  },
  classesAttended: {
    type: Number,
    default: 0
  },
  totalClasses: {
    type: Number,
    default: 0
  },
  released: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Grade', gradeSchema);
