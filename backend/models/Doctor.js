import mongoose from 'mongoose';

/**
 * Doctor Schema
 * Represents a doctor in the system with clinic and location information
 */
const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    // Validates: +91 followed by space (optional) and exactly 10 digits
    // Accepts: +91 9876543210, +919876543210
    // Stores as: +91-9876543210
    match: [/^\+91[\s-]?[6-9]\d{9}$/, 'Please provide a valid mobile number (e.g., +91 9876543210 or +919876543210)']
  },
  clinicName: {
    type: String,
    required: [true, 'Clinic name is required'],
    trim: true,
    maxlength: [200, 'Clinic name cannot exceed 200 characters']
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Location ID is required']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    required: [true, 'Status is required']
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

/**
 * Normalize mobile number before saving to database
 * Format: +91-XXXXXXXXXX (10 digits)
 */
doctorSchema.pre('save', async function(next) {
  // Normalize mobile number if it has been modified (or is new)
  if (this.isModified('mobileNumber') && this.mobileNumber) {
    // Remove all spaces, hyphens, and parentheses, then format as +91-XXXXXXXXXX
    const cleaned = this.mobileNumber.replace(/[\s\-()]/g, '');
    // Extract the 10 digits after +91
    const match = cleaned.match(/^\+91(\d{10})$/);
    if (match) {
      this.mobileNumber = `+91-${match[1]}`;
    }
  }
  next();
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;

