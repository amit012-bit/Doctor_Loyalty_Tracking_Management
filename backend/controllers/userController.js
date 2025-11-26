import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getAllLocations } from '../constants/locations.js';

/**
 * Generate JWT token
 * @param {string} userId - User ID to encode in token
 * @returns {string} - JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Register a new user
 * @route POST /api/users/register
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, locationId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      locationId
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/users/login
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    console.log(user, '------user------');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }


    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    console.log(isPasswordValid, '------isPasswordValid------');
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * @route GET /api/users/me
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (admin only)
 * @route GET /api/users
 */
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');

    res.json({
      success: true,
      count: users.length,
      data: { users }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @route PUT /api/users/me
 */
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, locationId } = req.body;
    const userId = req.user._id;

    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (locationId) updateData.locationId = locationId;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * @route DELETE /api/users/me
 */
export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get all available locations
 * @route GET /api/users/locations
 */
export const getLocations = async (req, res, next) => {
  try {
    const locations = getAllLocations();

    res.json({
      success: true,
      count: locations.length,
      data: { locations }
    });

  } catch (error) {
    next(error);
  }
};

