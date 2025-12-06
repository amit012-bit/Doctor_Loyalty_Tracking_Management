import express from 'express';
import { body } from 'express-validator';
import {
  getPlatformSettings,
  updatePlatformSettings
} from '../controllers/platformSettingsController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Get platform settings (any authenticated user can view)
router.get(
  '/',
  authenticate,
  getPlatformSettings
);

// Update platform settings (only admin, superadmin, and accountant)
router.put(
  '/',
  authenticate,
  authorize('admin', 'superadmin'),
  [
    body('isEnabled')
      .isBoolean()
      .withMessage('isEnabled must be a boolean value')
  ],
  validate,
  updatePlatformSettings
);

export default router;

