import mongoose from 'mongoose';

/**
 * Transaction Schema
 * Represents a transaction in the system
 */
const transactionSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor ID is required']
  },
  executiveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Location ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Online Transfer'],
    required: [true, 'Payment mode is required']
  },
  monthYear: {
    type: String,
    required: [true, 'Month/Year is required'],
    match: [/^(0[1-9]|1[0-2])\/\d{4}$/, 'Month/Year must be in MM/YYYY format']
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  deliveryDate: {
    type: Date,
    default: null
  },
  otp: {
    type: String,
    default: null,
    minlength: [6, 'OTP must be 6 digits'],
    maxlength: [6, 'OTP must be 6 digits']
  }
}, {
  timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;

