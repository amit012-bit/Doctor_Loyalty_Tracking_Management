import express from 'express';
import { body } from 'express-validator';
import {
  getTransactions,
  getTransactionStatistics,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   GET /api/transactions/statistics
 * @desc    Get transaction statistics
 * @access  Private
 */
router.get('/statistics', authenticate, getTransactionStatistics);

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions with filters
 * @access  Private
 */
router.get('/', authenticate, getTransactions);

/**
 * @route   GET /api/transactions/:id
 * @desc    Get transaction by ID
 * @access  Private
 */
router.get('/:id', authenticate, getTransactionById);

/**
 * @route   POST /api/transactions
 * @desc    Create new transaction
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  [
    body('doctorId')
      .notEmpty()
      .withMessage('Doctor ID is required'),
    body('executiveId')
      .notEmpty()
      .withMessage('Executive ID is required'),
    body('locationId')
      .notEmpty()
      .withMessage('Location ID is required'),
    body('amount')
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number'),
    body('paymentMode')
      .isIn(['Cash', 'Online Transfer'])
      .withMessage('Payment mode must be either Cash or Online Transfer'),
    body('monthYear')
      .matches(/^(0[1-9]|1[0-2])\/\d{4}$/)
      .withMessage('Month/Year must be in MM/YYYY format'),
    body('status')
      .optional()
      .isIn(['started', 'IN progress', 'pending', 'completed'])
      .withMessage('Invalid status')
  ],
  validate,
  createTransaction
);

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update transaction
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  [
    body('amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number'),
    body('paymentMode')
      .optional()
      .isIn(['Cash', 'Online Transfer'])
      .withMessage('Payment mode must be either Cash or Online Transfer'),
    body('monthYear')
      .optional()
      .matches(/^(0[1-9]|1[0-2])\/\d{4}$/)
      .withMessage('Month/Year must be in MM/YYYY format'),
    body('status')
      .optional()
      .isIn(['started', 'IN progress', 'pending', 'completed'])
      .withMessage('Invalid status')
  ],
  validate,
  updateTransaction
);

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete transaction
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), deleteTransaction);

export default router;

