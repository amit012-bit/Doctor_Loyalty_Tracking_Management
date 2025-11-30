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
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
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
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  validate,
  loginUser
);
router.get('/me', authenticate, getCurrentUser);
router.put(
  '/me',
  authenticate,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('phoneNumber')
      .optional()
      .matches(/^\+91[\s-]?[6-9]\d{9}$/)
      .withMessage('Please provide a valid phone number (e.g., +91 9876543210 or +919876543210)'),
    body('locationId')
      .optional()
      .notEmpty()
      .withMessage('Location ID cannot be empty')
  ],
  validate,
  updateUser
);
router.delete('/me', authenticate, deleteUser);
router.get('/', authenticate, authorize('admin', 'doctor', 'superadmin', 'accountant'), getUsers);
router.get('/:id', authenticate, getUserById);
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'superadmin'),
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('phoneNumber')
      .optional()
      .matches(/^\+91[\s-]?[6-9]\d{9}$/)
      .withMessage('Please provide a valid phone number (e.g., +91 9876543210 or +919876543210)'),
    body('locationId')
      .optional()
      .notEmpty()
      .withMessage('Location ID cannot be empty'),
    body('role')
      .optional()
      .isIn(['admin', 'doctor', 'executive', 'superadmin', 'accountant'])
      .withMessage('Invalid role')
  ],
  validate,
  updateUserById
);

export default router;

