import mongoose from 'mongoose';

/**
 * Executive Schema
 * Represents an executive in the system with location information
 */
const executiveSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default in queries
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    // Validates: +91 followed by space (optional) and exactly 10 digits
    // Accepts: +91 9876543210, +919876543210
    // Stores as: +91-9876543210
    match: [/^\+91[\s-]?[6-9]\d{9}$/, 'Please provide a valid phone number (e.g., +91 9876543210 or +919876543210)']
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
 * Normalize phone number before saving to database
 * Format: +91-XXXXXXXXXX (10 digits)
 */
executiveSchema.pre('save', async function(next) {
  // Normalize phone number if it has been modified (or is new)
  if (this.isModified('phoneNumber') && this.phoneNumber) {
    // Remove all spaces, hyphens, and parentheses, then format as +91-XXXXXXXXXX
    const cleaned = this.phoneNumber.replace(/[\s\-()]/g, '');
    // Extract the 10 digits after +91
    const match = cleaned.match(/^\+91(\d{10})$/);
    if (match) {
      this.phoneNumber = `+91-${match[1]}`;
    }
  }
  next();
});

/**
 * Compare provided password with password in database (plain text comparison)
 * @param {string} candidatePassword - Password to compare
 * @returns {boolean} - True if passwords match
 */
executiveSchema.methods.comparePassword = function(candidatePassword) {
  return candidatePassword === this.password;
};

/**
 * Remove password from JSON output
 */
executiveSchema.methods.toJSON = function() {
  const executiveObject = this.toObject();
  delete executiveObject.password;
  return executiveObject;
};

const Executive = mongoose.model('Executive', executiveSchema);

export default Executive;

