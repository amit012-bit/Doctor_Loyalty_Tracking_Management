import express from 'express';
import { body } from 'express-validator';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserById,
  deleteUser
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { checkPlatformStatus } from '../middleware/platformStatus.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^\+91[\s-]?[6-9]\d{9}$/)
      .withMessage('Please provide a valid phone number (e.g., +91 9876543210 or +919876543210)'),
    body('locationId')
      .notEmpty()
      .withMessage('Location ID is required')
  ],
  validate,
  registerUser
);
router.post(
  '/login',
  [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  validate,
  loginUser
);
router.get('/me', authenticate, checkPlatformStatus, getCurrentUser);
router.put(
  '/me',
  authenticate,
  checkPlatformStatus,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('phoneNumber')
      .optional()
      .matches(/^\+91[\s-]?[6-9]\d{9}$/)
      .withMessage('Please provide a valid phone number (e.g., +91 9876543210 or +919876543210)'),
    body('locationId')
      .optional()
      .notEmpty()
      .withMessage('Location ID cannot be empty')
      .isMongoId()
      .withMessage('Location ID must be a valid MongoDB ObjectId'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  validate,
  updateUser
);
router.delete('/me', authenticate, checkPlatformStatus, deleteUser);
router.delete('/:id', authenticate, checkPlatformStatus, authorize('superadmin'), deleteUser);
router.get('/', authenticate, checkPlatformStatus, authorize('admin', 'doctor', 'superadmin', 'accountant'), getUsers);
router.get('/:id', authenticate, checkPlatformStatus, getUserById);
router.put(
  '/:id',
  authenticate,
  checkPlatformStatus,
  authorize('admin', 'superadmin'),
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('phoneNumber')
      .optional()
      .matches(/^\+91[\s-]?[6-9]\d{9}$/)
      .withMessage('Please provide a valid phone number (e.g., +91 9876543210 or +919876543210)'),
    body('locationId')
      .optional()
      .notEmpty()
      .withMessage('Location ID cannot be empty')
      .isMongoId()
      .withMessage('Location ID must be a valid MongoDB ObjectId'),
    body('role')
      .optional()
      .isIn(['admin', 'doctor', 'executive', 'superadmin', 'accountant'])
      .withMessage('Invalid role'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  validate,
  updateUserById
);

export default router;

