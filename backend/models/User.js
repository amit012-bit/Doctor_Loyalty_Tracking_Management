import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { getLocationIds } from '../constants/locations.js';

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
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default in queries
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'executive'],
    required: [true, 'Role is required']
  },
  locationId: {
    type: String,
    enum: {
      values: getLocationIds(),
      message: 'Invalid location ID'
    },
    required: [true, 'Location ID is required']
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
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

