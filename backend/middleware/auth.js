import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Executive from '../models/Executive.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1]; // Format: "Bearer <token>"

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a token.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');

    // Try to find user in User collection first (admin, accountant, superadmin)
    let user = await User.findById(decoded.userId).select('-password');

    // If not found in User collection, try Executive collection
    if (!user) {
      user = await Executive.findById(decoded.userId).select('-password');
      // If found in Executive, set role to 'executive'
      if (user) {
        user = user.toObject();
        user.role = 'executive';
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.'
      });
    }

    // Attach user to request object
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

/**
 * Authorization middleware
 * Checks if user has required role(s)
 * @param {...string} roles - Roles allowed to access the route
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};

