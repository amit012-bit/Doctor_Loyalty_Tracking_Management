import express from 'express';
import { body } from 'express-validator';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  getUsers,
  getUserById,
  updateUser,
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
    body('locationId')
      .optional()
      .notEmpty()
      .withMessage('Location ID cannot be empty')
  ],
  validate,
  updateUser
);
router.delete('/me', authenticate, deleteUser);
router.get('/', authenticate, authorize('admin','doctor'), getUsers);
router.get('/:id', authenticate, getUserById);

export default router;

