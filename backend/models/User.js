import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema
 * Represents a user in the system with authentication and profile information
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
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
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default in queries
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'executive', 'superadmin', 'accountant'],
    required: [true, 'Role is required']
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Location ID is required']
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

/**
 * Normalize phone number before saving to database
 * Format: +91-XXXXXXXXXX (10 digits)
 */
userSchema.pre('save', async function(next) {
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
 * Hash password before saving to database
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare provided password with hashed password in database
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Remove password from JSON output
 */
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema, 'User');

export default User;

