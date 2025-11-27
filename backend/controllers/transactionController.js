import Transaction from '../models/Transaction.js';

export const getTransactions = async (req, res, next) => {
  try {
    const { status, locationId, doctorId, executiveId, monthYear } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (locationId) filter.locationId = locationId;
    if (doctorId) filter.doctorId = doctorId;
    if (executiveId) filter.executiveId = executiveId;
    if (monthYear) filter.monthYear = monthYear;

    const transactions = await Transaction.find(filter)
      .populate('doctorId', 'name email')
      .populate('executiveId', 'name email')
      .populate('locationId', 'name address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      data: { transactions }
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionStatistics = async (req, res, next) => {
  try {
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalCash = await Transaction.aggregate([
      {
        $match: { paymentMode: 'Cash' }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const result = {
      delivered: { count: 0, amount: 0 },
      inProgress: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 },
      cashInHand: totalCash[0]?.total || 0
    };

    stats.forEach(stat => {
      if (stat._id === 'completed') {
        result.delivered = { count: stat.count, amount: stat.totalAmount };
      } else if (stat._id === 'in_progress') {
        result.inProgress = { count: stat.count, amount: stat.totalAmount };
      } else if (stat._id === 'pending') {
        result.pending = { count: stat.count, amount: stat.totalAmount };
      }
    });

    res.json({
      success: true,
      data: { statistics: result }
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('doctorId', 'name email')
      .populate('executiveId', 'name email')
      .populate('locationId', 'name address');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createTransaction = async (req, res, next) => {
  try {
    const {
      doctorId,
      executiveId,
      locationId,
      amount,
      paymentMode,
      monthYear,
      status,
      deliveryDate
    } = req.body;

    // Set status based on whether executive is assigned
    // If executive is assigned -> in_progress, if not -> pending
    const finalStatus = status || (executiveId ? 'in_progress' : 'pending');

    // Generate OTP if status is in_progress
    const otp = finalStatus === 'in_progress' ? generateOTP() : null;

    const transaction = await Transaction.create({
      doctorId,
      executiveId: executiveId || null, // Allow null for pending transactions
      locationId,
      amount,
      paymentMode,
      monthYear,
      status: finalStatus,
      deliveryDate: deliveryDate || null,
      otp: otp
    });

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('doctorId', 'name email')
      .populate('executiveId', 'name email')
      .populate('locationId', 'name address');

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: { transaction: populatedTransaction }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const transactionId = req.params.id;

    if (!otp || otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit OTP'
      });
    }

    // Find the transaction
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if transaction is in_progress
    if (transaction.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'OTP can only be verified for transactions in progress'
      });
    }

    // Check if OTP exists for this transaction
    if (!transaction.otp) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found for this transaction'
      });
    }

    // Verify OTP
    if (transaction.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // OTP is correct, update status to completed
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { 
        status: 'completed',
        deliveryDate: new Date() // Set delivery date when OTP is verified
      },
      { new: true, runValidators: true }
    )
      .populate('doctorId', 'name email')
      .populate('executiveId', 'name email')
      .populate('locationId', 'name address');

    res.json({
      success: true,
      message: 'OTP verified successfully. Transaction completed.',
      data: { transaction: updatedTransaction }
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const {
      doctorId,
      executiveId,
      locationId,
      amount,
      paymentMode,
      monthYear,
      status,
      deliveryDate
    } = req.body;

    const updateData = {};
    if (doctorId) updateData.doctorId = doctorId;
    if (executiveId) updateData.executiveId = executiveId;
    if (locationId) updateData.locationId = locationId;
    if (amount !== undefined) updateData.amount = amount;
    if (paymentMode) updateData.paymentMode = paymentMode;
    if (monthYear) updateData.monthYear = monthYear;
    if (status) updateData.status = status;
    if (deliveryDate !== undefined) updateData.deliveryDate = deliveryDate;

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('doctorId', 'name email')
      .populate('executiveId', 'name email')
      .populate('locationId', 'name address');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

