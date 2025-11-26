import Transaction from '../models/Transaction.js';

/**
 * Get all transactions with filters and pagination
 * @route GET /api/transactions
 */
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

/**
 * Get transaction statistics
 * @route GET /api/transactions/statistics
 */
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
      started: { count: 0, amount: 0 },
      cashInHand: totalCash[0]?.total || 0
    };

    stats.forEach(stat => {
      if (stat._id === 'completed') {
        result.delivered = { count: stat.count, amount: stat.totalAmount };
      } else if (stat._id === 'IN progress') {
        result.inProgress = { count: stat.count, amount: stat.totalAmount };
      } else if (stat._id === 'pending') {
        result.pending = { count: stat.count, amount: stat.totalAmount };
      } else if (stat._id === 'started') {
        result.started = { count: stat.count, amount: stat.totalAmount };
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

/**
 * Get transaction by ID
 * @route GET /api/transactions/:id
 */
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

/**
 * Create new transaction
 * @route POST /api/transactions
 */
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

    const transaction = await Transaction.create({
      doctorId,
      executiveId,
      locationId,
      amount,
      paymentMode,
      monthYear,
      status: status || 'pending',
      deliveryDate: deliveryDate || null
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

/**
 * Update transaction
 * @route PUT /api/transactions/:id
 */
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

/**
 * Delete transaction
 * @route DELETE /api/transactions/:id
 */
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

