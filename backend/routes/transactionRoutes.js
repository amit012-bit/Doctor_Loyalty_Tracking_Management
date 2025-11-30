import express from 'express';
import { body } from 'express-validator';
import {
  getTransactions,
  getTransactionStatistics,
  getTransactionById,
  createTransaction,
  createBulkTransactions,
  updateTransaction,
  deleteTransaction,
  verifyOTP
} from '../controllers/transactionController.js';
import Transaction from '../models/Transaction.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();


router.get('/statistics', authenticate, getTransactionStatistics);
router.get('/', authenticate, getTransactions);
router.get('/:id', authenticate, getTransactionById);
router.post(
  '/',
  authenticate,
  authorize('admin', 'superadmin', 'accountant'),
  [
    body('doctorId')
      .notEmpty()
      .withMessage('Doctor ID is required'),
    body('executiveId')
      .optional()
      .custom((value, { req }) => {
        // Executive is optional for pending status
        if (req.body.status === 'pending' || !req.body.status) {
          return true;
        }
        // For other statuses, executive is required
        if (!value) {
          throw new Error('Executive ID is required for non-pending transactions');
        }
        return true;
      }),
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
      .isIn(['pending', 'in_progress', 'completed'])
      .withMessage('Invalid status')
  ],
  validate,
  createTransaction
);
router.post(
  '/bulk',
  authenticate,
  [
    body('transactions')
      .isArray({ min: 1 })
      .withMessage('Transactions must be a non-empty array'),
    body('transactions.*.doctorId')
      .notEmpty()
      .withMessage('Doctor ID is required for all transactions'),
    body('transactions.*.locationId')
      .notEmpty()
      .withMessage('Location ID is required for all transactions'),
    body('transactions.*.amount')
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number for all transactions'),
    body('transactions.*.paymentMode')
      .isIn(['Cash', 'Online Transfer'])
      .withMessage('Payment mode must be either Cash or Online Transfer'),
    body('transactions.*.monthYear')
      .matches(/^(0[1-9]|1[0-2])\/\d{4}$/)
      .withMessage('Month/Year must be in MM/YYYY format for all transactions')
  ],
  validate,
  createBulkTransactions
);
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'superadmin', 'accountant'),
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
      .isIn(['pending', 'in_progress', 'completed'])
      .withMessage('Invalid status')
  ],
  validate,
  updateTransaction
);
router.patch(
  '/:id/assign-executive',
  authenticate,
  [
    body('executiveId')
      .notEmpty()
      .withMessage('Executive ID is required')
  ],
  validate,
  async (req, res, next) => {
    try {
      // Get current transaction to check status
      const currentTransaction = await Transaction.findById(req.params.id);
      if (!currentTransaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      // Prepare update data
      const updateData = {
        executiveId: req.body.executiveId
      };

      // If transaction is pending, change status to in_progress and generate OTP
      if (currentTransaction.status === 'pending') {
        updateData.status = 'in_progress';
        // Generate 6-digit OTP
        updateData.otp = Math.floor(100000 + Math.random() * 900000).toString();
      }

      // Update transaction
      const transaction = await Transaction.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      )
        .populate('doctorId', 'name email')
        .populate('executiveId', 'name email')
        .populate('locationId', 'name address');

      res.json({
        success: true,
        message: 'Executive assigned successfully',
        data: { transaction }
      });
    } catch (error) {
      next(error);
    }
  }
);
router.patch(
  '/:id/verify-otp',
  authenticate,
  [
    body('otp')
      .notEmpty()
      .withMessage('OTP is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits')
      .matches(/^\d{6}$/)
      .withMessage('OTP must contain only numbers')
  ],
  validate,
  verifyOTP
);

router.delete('/:id', authenticate, authorize('admin', 'superadmin'), deleteTransaction);

export default router;

