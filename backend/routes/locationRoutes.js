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

router.get('/', getLocations);
router.get('/:id', getLocationById);
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
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), deleteLocation);

export default router;

