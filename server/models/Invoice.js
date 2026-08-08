import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema({
  courseCode: { type: String, required: true },
  amount: { type: Number, required: true }
}, { _id: false });

const paymentHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  paidAt: { type: Date, default: Date.now },
  reference: { type: String, default: '' }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  enrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true },
  semester: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'partially_paid', 'paid'], default: 'pending' },
  lineItems: [lineItemSchema],
  totalAmountDue: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  paymentHistory: [paymentHistorySchema]
}, { timestamps: true });

export default mongoose.model('Invoice', invoiceSchema);
