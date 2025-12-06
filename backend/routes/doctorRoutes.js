import express from 'express';
import { body } from 'express-validator';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
} from '../controllers/doctorController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { checkPlatformStatus } from '../middleware/platformStatus.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Get all doctors
router.get(
  '/',
  authenticate,
  checkPlatformStatus,
  authorize('admin', 'superadmin', 'accountant'),
  getDoctors
);

// Get doctor by ID
router.get(
  '/:id',
  authenticate,
  checkPlatformStatus,
  authorize('admin', 'superadmin', 'accountant'),
  getDoctorById
);

// Create doctor
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
    body('mobileNumber')
      .notEmpty()
      .withMessage('Mobile number is required')
      .matches(/^\+91[\s-]?[6-9]\d{9}$/)
      .withMessage('Please provide a valid mobile number (e.g., +91 9876543210 or +919876543210)'),
    body('clinicName')
      .trim()
      .notEmpty()
      .withMessage('Clinic name is required')
      .isLength({ max: 200 })
      .withMessage('Clinic name cannot exceed 200 characters'),
    body('locationId')
      .notEmpty()
      .withMessage('Location ID is required')
      .isMongoId()
      .withMessage('Location ID must be a valid MongoDB ObjectId'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Status must be active, inactive, or pending')
  ],
  validate,
  createDoctor
);

// Update doctor
router.put(
  '/:id',
  authenticate,
  checkPlatformStatus,
  authorize('admin', 'superadmin'),
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('mobileNumber')
      .optional()
      .matches(/^\+91[\s-]?[6-9]\d{9}$/)
      .withMessage('Please provide a valid mobile number (e.g., +91 9876543210 or +919876543210)'),
    body('clinicName')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Clinic name cannot exceed 200 characters'),
    body('locationId')
      .optional()
      .isMongoId()
      .withMessage('Location ID must be a valid MongoDB ObjectId'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Status must be active, inactive, or pending')
  ],
  validate,
  updateDoctor
);

// Delete doctor
router.delete(
  '/:id',
  authenticate,
  checkPlatformStatus,
  authorize('admin', 'superadmin'),
  deleteDoctor
);

export default router;

