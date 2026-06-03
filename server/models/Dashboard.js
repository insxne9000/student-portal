import mongoose from 'mongoose';

const dashboardSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    welcome: {
      name: { type: String, required: true },
      matricNo: { type: String, required: true },
      level: { type: String, required: true },
      programme: { type: String, required: true },
      admissionType: { type: String, required: true },
      profileImage: { type: String, required: true },
    },
    complaints: {
      total: { type: Number, required: true },
      pending: { type: Number, required: true },
      resolved: { type: Number, required: true },
    },
    registration: {
      session: { type: String, required: true },
      status: { type: String, required: true },
      unitsRegistered: { type: Number, required: true },
      maxUnits: { type: Number, required: true },
    },
    clearance: {
      completed: { type: Number, required: true },
      total: { type: Number, required: true },
      items: [
        {
          label: { type: String, required: true },
          status: { type: String, required: true },
        },
      ],
    },
    semester: {
      label: { type: String, required: true },
      stage: { type: String, required: true },
      week: { type: Number, required: true },
      totalWeeks: { type: Number, required: true },
      examStarts: { type: String, required: true },
    },
    documents: {
      total: { type: Number, required: true },
      items: [
        {
          label: { type: String, required: true },
          status: { type: String, required: true },
        },
      ],
    },
    disciplinary: {
      status: { type: String, required: true },
      warnings: { type: Number, required: true },
      suspensionHistory: { type: String, required: true },
      standing: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Dashboard", dashboardSchema);
