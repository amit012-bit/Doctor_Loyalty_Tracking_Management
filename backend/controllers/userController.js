import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Executive from '../models/Executive.js';
import PlatformSettings from '../models/PlatformSettings.js';

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate random password
const generateRandomPassword = () => {
  const length = 8;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

export const registerUser = async (req, res, next) => {
  try {
    const { name, username, role, locationId, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this username already exists'
      });
    }

    // Generate random password
    const password = generateRandomPassword();

    // Create new user
    const user = await User.create({
      name,
      username,
      password, // Store password in plain text
      role: role || 'user',
      locationId,
      phoneNumber
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
        password // Return generated password so it can be shared with user
      }
    });

  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    let user = null;
    let userType = null;

    // First, try to find in User collection (admin, accountant, superadmin)
    user = await User.findOne({ username }).select('+password');
    if (user) {
      userType = 'user';
    } else {
      // If not found in User, try Executive collection
      user = await Executive.findOne({ username }).select('+password');
      if (user) {
        userType = 'executive';
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Verify password (plain text comparison)
    const isPasswordValid = user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Check platform status for executives and accountants
    if (userType === 'executive' || (userType === 'user' && user.role === 'accountant')) {
      const platformSettings = await PlatformSettings.getSettings();
      if (!platformSettings.isEnabled) {
        return res.status(503).json({
          success: false,
          message: 'Platform is currently disabled. Please contact your administrator.',
          platformDisabled: true
        });
      }
    }

    // Generate token
    const token = generateToken(user._id);

    // Prepare user response based on type
    const userResponse = {
      _id: user._id,
      name: user.name,
      username: user.username
    };

    // Add role for User collection (admin, accountant, superadmin)
    if (userType === 'user') {
      userResponse.role = user.role;
      userResponse.phoneNumber = user.phoneNumber;
      userResponse.locationId = user.locationId;
    } else {
      // For Executive collection
      userResponse.role = 'executive';
      userResponse.phoneNumber = user.phoneNumber;
      userResponse.locationId = user.locationId;
      userResponse.status = user.status;
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

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

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('locationId', 'name address');

    res.json({
      success: true,
      count: users.length,
      data: { users }
    });

  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('locationId', 'name address');

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

export const updateUser = async (req, res, next) => {
  try {
    const { name, email, locationId, phoneNumber } = req.body;
    const userId = req.user._id;

    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (locationId) updateData.locationId = locationId;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

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

export const updateUserById = async (req, res, next) => {
  try {
    const { name, email, locationId, role, password, phoneNumber } = req.body;
    const userId = req.params.id;

    // Find user first to handle password update properly
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (locationId) updateData.locationId = locationId;
    if (role) updateData.role = role;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password = password;
    }

    // Update user
    Object.assign(user, updateData);
    await user.save();

    // Return user without password
    const updatedUser = await User.findById(userId).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    next(error);
  }
};


