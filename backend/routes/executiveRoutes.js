import express from 'express';
import { body } from 'express-validator';
import {
  getExecutives,
  getExecutiveById,
  createExecutive,
  updateExecutive,
  deleteExecutive
} from '../controllers/executiveController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { checkPlatformStatus } from '../middleware/platformStatus.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Get all executives
router.get(
  '/',
  authenticate,
  checkPlatformStatus,
  authorize('admin', 'superadmin', 'accountant'),
  getExecutives
);

// Get executive by ID
router.get(
  '/:id',
  authenticate,
  checkPlatformStatus,
  authorize('admin', 'superadmin', 'accountant', 'executive'),
  getExecutiveById
);

// Create executive
router.post(
  '/',
  authenticate,
  checkPlatformStatus,
  authorize('admin', 'superadmin'),
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^\+91[\s-]?[6-9]\d{9}$/)
      .withMessage('Please provide a valid phone number (e.g., +91 9876543210 or +919876543210)'),
    body('locationId')
      .notEmpty()
      .withMessage('Location ID is required')
      .isMongoId()
      .withMessage('Location ID must be a valid MongoDB ObjectId'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Status must be active or inactive')
  ],
  validate,
  createExecutive
);

// Update executive
router.put(
  '/:id',
  authenticate,
  checkPlatformStatus,
  authorize('admin', 'superadmin', 'accountant', 'executive'),
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('phoneNumber')
      .optional()
      .matches(/^\+91[\s-]?[6-9]\d{9}$/)
      .withMessage('Please provide a valid phone number (e.g., +91 9876543210 or +919876543210)'),
    body('locationId')
      .optional()
      .isMongoId()
      .withMessage('Location ID must be a valid MongoDB ObjectId'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Status must be active or inactive')
  ],
  validate,
  updateExecutive
);

// Delete executive
router.delete(
  '/:id',
  authenticate,
  checkPlatformStatus,
  authorize('admin', 'superadmin'),
  deleteExecutive
);

export default router;

