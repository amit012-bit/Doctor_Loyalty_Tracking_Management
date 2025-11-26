import express from 'express';
import { body } from 'express-validator';
import {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation
} from '../controllers/locationController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   GET /api/locations
 * @desc    Get all locations
 * @access  Public
 */
router.get('/', getLocations);

/**
 * @route   GET /api/locations/:id
 * @desc    Get location by ID
 * @access  Public
 */
router.get('/:id', getLocationById);

/**
 * @route   POST /api/locations
 * @desc    Create new location
 * @access  Private/Admin
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'superadmin'),
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Location name is required')
      .isLength({ max: 100 })
      .withMessage('Location name cannot exceed 100 characters'),
    body('address')
      .trim()
      .notEmpty()
      .withMessage('Address is required')
      .isLength({ max: 200 })
      .withMessage('Address cannot exceed 200 characters')
  ],
  validate,
  createLocation
);

/**
 * @route   PUT /api/locations/:id
 * @desc    Update location
 * @access  Private/Admin
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'superadmin'),
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Location name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Location name cannot exceed 100 characters'),
    body('address')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Address cannot be empty')
      .isLength({ max: 200 })
      .withMessage('Address cannot exceed 200 characters')
  ],
  validate,
  updateLocation
);

/**
 * @route   DELETE /api/locations/:id
 * @desc    Delete location
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), deleteLocation);

export default router;

