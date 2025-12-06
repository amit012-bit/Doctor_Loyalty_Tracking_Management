import Transaction from '../models/Transaction.js';
import { sendOTPEmail, sendCompletionEmail } from '../services/emailService.js';
import Doctor from '../models/Doctor.js';
import sendSMS from '../services/smsSevice.js';
import { otpSmsTemplate, transactionSmsTemplate } from '../templates/smsTemplate.js';

export const getTransactions = async (req, res, next) => {
  try {
    const { status, locationId, doctorId, executiveId, monthYear } = req.query;
    const filter = {};
    const userRole = req.user?.role;
    const userId = req.user?._id;

    // Role-based filtering
    if (userRole === 'executive') {
      // Executives can only see their own transactions with in_progress or completed status
      filter.executiveId = userId;
      if(status) 
        filter.status = status ;
      else
        filter.status = { $in: ['in_progress', 'completed'] };
    } else {
      // Admin, Superadmin, Accountant, Doctor can see all transactions
      if (status) filter.status = status;
      if (locationId) filter.locationId = locationId;
      if (doctorId) filter.doctorId = doctorId;
      if (executiveId) filter.executiveId = executiveId;
      if (monthYear) filter.monthYear = monthYear;
    }

    const transactions = await Transaction.find(filter)
      .populate('doctorId', 'name mobileNumber clinicName locationId status')
      .populate('executiveId', 'name phoneNumber locationId status')
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
    const userRole = req.user?.role;
    const userId = req.user?._id;
    
    // Build match filter based on role
    const matchFilter = {};
    if (userRole === 'executive') {
      // Executives can only see statistics for their own transactions
      matchFilter.executiveId = userId;
      matchFilter.status = { $in: ['in_progress', 'completed'] };
    }

    const stats = await Transaction.aggregate([
      ...(Object.keys(matchFilter).length > 0 ? [{ $match: matchFilter }] : []),
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalCashMatch = { paymentMode: 'Cash', ...matchFilter };
    const totalCash = await Transaction.aggregate([
      {
        $match: totalCashMatch
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
    const userRole = req.user?.role;
    const userId = req.user?._id;

    const transaction = await Transaction.findById(req.params.id)
      .populate('doctorId', 'name mobileNumber clinicName locationId status')
      .populate('executiveId', 'name phoneNumber locationId status')
      .populate('locationId', 'name address');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Role-based access control
    if (userRole === 'executive') {
      // Executives can only view their own transactions
      const executiveId = transaction.executiveId?._id?.toString() || transaction.executiveId?.toString();
      if (executiveId !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this transaction'
        });
      }
      
      // Executives can only view in_progress or completed transactions
      if (!['in_progress', 'completed'].includes(transaction.status)) {
        return res.status(403).json({
          success: false,
          message: 'You can only view in-progress or completed transactions'
        });
      }
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
    const userRole = req.user?.role;

    // Role-based access: Only admin, superadmin, and accountant can create transactions
    if (!['admin', 'superadmin', 'accountant'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create transactions'
      });
    }

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

    const otp =  generateOTP() 

    const transaction = await Transaction.create({
      doctorId,
      executiveId: executiveId || null, // Allow null for pending transactions
      locationId,
      amount,
      paymentMode,
      monthYear,
      status,
      deliveryDate: deliveryDate || null,
      otp: otp
    });

    const doctorMobileNumber = await Doctor.findById(doctorId).select('mobileNumber');
    console.log("doctorMobileNumber", doctorMobileNumber);
    if (!doctorMobileNumber) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('doctorId', 'name mobileNumber clinicName locationId status')
      .populate('executiveId', 'name phoneNumber locationId status')
      .populate('locationId', 'name address');

    // Send OTP email to doctor if OTP was generated
    if (otp) {
      try {
       const smsTemplate = transactionSmsTemplate(transaction, populatedTransaction.executiveId.name);
       sendSMS(smsTemplate, doctorMobileNumber.mobileNumber);
      } catch (error) {
        console.error('❌ Error sending SMS:', error.message);
      }
    }

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
    const userRole = req.user?.role;
    const userId = req.user?._id;

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

    // Role-based access control for OTP verification
    if (userRole === 'executive') {
      // Executives can only verify OTP for their own transactions
      const executiveId = transaction.executiveId?.toString();
      if (executiveId !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only verify OTP for your own transactions'
        });
      }
    }
    // Check if OTP exists for this transaction
    if (!transaction.otp) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found for this transaction'
      });
    }

    // Verify OTP - Compare as strings to ensure exact match
    // Only proceed if OTP matches exactly, otherwise return error without updating status
    if (String(transaction.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Wrong OTP entered. Please try again.'
      });
    }

    // OTP is correct - ONLY NOW update status to completed
    // This ensures status is only changed when correct OTP is verified
    const deliveryDate = new Date();
    
    // Calculate TAT (Turn Around Time) in hours: from createdAt to current time
    const createdAt = transaction.createdAt;
    const timeDifference = deliveryDate.getTime() - createdAt.getTime();
    const tatInHours = timeDifference / (1000 * 60 * 60); // Convert milliseconds to hours
    
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { 
        status: 'completed',
        deliveryDate: deliveryDate, // Set delivery date when OTP is verified
        tat: tatInHours // Store TAT in hours
      },
      { new: true, runValidators: true }
    )
      .populate('doctorId', 'name mobileNumber clinicName locationId status')
      .populate('executiveId', 'name phoneNumber locationId status')
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
    const userRole = req.user?.role;

    // Role-based access: Executives cannot update transactions
    if (userRole === 'executive') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update transactions'
      });
    }

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

    // Get the current transaction to check if status is changing to in_progress
    const currentTransaction = await Transaction.findById(req.params.id);
    if (!currentTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const updateData = {};
    if (doctorId) updateData.doctorId = doctorId;
    if (executiveId) updateData.executiveId = executiveId;
    if (locationId) updateData.locationId = locationId;
    if (amount !== undefined) updateData.amount = amount;
    if (paymentMode) updateData.paymentMode = paymentMode;
    if (monthYear) updateData.monthYear = monthYear;
    if (status) updateData.status = status;
    if (deliveryDate !== undefined) updateData.deliveryDate = deliveryDate;

    // Generate OTP if status is being changed to 'in_progress' and it wasn't already in_progress
    let newOtp = null;
    if (status === 'in_progress' && currentTransaction.status !== 'in_progress') {
      newOtp = generateOTP();
      updateData.otp = newOtp;
    }

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('doctorId', 'name mobileNumber clinicName locationId status')
      .populate('executiveId', 'name phoneNumber locationId status')
      .populate('locationId', 'name address');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Send OTP email if a new OTP was generated (status changed to in_progress)
    if (newOtp && status === 'in_progress') {
      try {
        // Get doctor's information - doctors don't have email, so we'll use test email
        let doctorEmail = null;
        
        // Check if doctorId is populated (object) or just an ObjectId
        const doctorIdValue = transaction.doctorId?._id || transaction.doctorId;
        
        if (doctorIdValue) {
          // Fetch doctor details to get name for logging
          const doctor = await Doctor.findById(doctorIdValue).select('name mobileNumber');
          // Use test email since doctors don't have email in the model
          doctorEmail = process.env.TEST_DOCTOR_EMAIL || 'sharktankindia1122@gmail.com';
          console.log(`📧 Doctor: ${doctor?.name || 'Unknown'} (${doctor?.mobileNumber || 'N/A'}) - Using test email: ${doctorEmail}`);
        }

        if (doctorEmail) {
          // Send OTP email to doctor (using test email since Doctor model doesn't have email)
          await sendOTPEmail(
            doctorEmail,
            newOtp,
            {
              amount: transaction.amount || amount,
              paymentMode: transaction.paymentMode || paymentMode,
              monthYear: transaction.monthYear || monthYear
            }
          );
          console.log(`📧 OTP email sent to doctor: ${doctorEmail}`);
        } else {
          console.warn('⚠️  Doctor not found. OTP email not sent.');
        }
      } catch (emailError) {
        // Log email error but don't fail the transaction update
        console.error('❌ Error sending OTP email:', emailError.message);
        // Continue with transaction update even if email fails
      }
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

export const resendOTP = async (req, res, next) => {
  try {
    const transactionId = req.params.id;
    const userRole = req.user?.role;

    // Find the transaction
    const transaction = await Transaction.findById(transactionId)
      .populate('doctorId', 'name mobileNumber clinicName locationId status')
      .populate('executiveId', 'name phoneNumber locationId status');

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
        message: 'OTP can only be resent for transactions in progress'
      });
    }

    // Check if OTP exists
    if (!transaction.otp) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found for this transaction'
      });
    }

    // Get doctor's mobile number
    const doctorMobileNumber = transaction.doctorId?.mobileNumber;
    if (!doctorMobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Doctor mobile number not found'
      });
    }

    // Send OTP via SMS using the same OTP (not generating a new one)
    try {
      const executiveName = transaction.executiveId?.name || 'Executive';
      const smsTemplate = transactionSmsTemplate(transaction, executiveName);
      await sendSMS(smsTemplate, doctorMobileNumber);
      console.log(`📱 OTP resent to doctor: ${doctorMobileNumber}`);
    } catch (smsError) {
      console.error('❌ Error sending SMS:', smsError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'OTP resent successfully to doctor'
    });
  } catch (error) {
    next(error);
  }
};

export const createBulkTransactions = async (req, res, next) => {
  try {
    const { transactions } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of transactions'
      });
    }

    const createdTransactions = [];
    const errors = [];

    for (let i = 0; i < transactions.length; i++) {
      const transactionData = transactions[i];
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
        } = transactionData;

        // Set status based on whether executive is assigned
        const finalStatus = status || (executiveId ? 'in_progress' : 'pending');

        // Generate OTP if status is in_progress
        const otp = finalStatus === 'in_progress' ? generateOTP() : null;

        const transaction = await Transaction.create({
          doctorId,
          executiveId: executiveId || null,
          locationId,
          amount: parseFloat(amount),
          paymentMode,
          monthYear,
          status: finalStatus,
          deliveryDate: deliveryDate || null,
          otp: otp
        });

        const populatedTransaction = await Transaction.findById(transaction._id)
          .populate('doctorId', 'name mobileNumber clinicName locationId status')
          .populate('executiveId', 'name phoneNumber locationId status')
          .populate('locationId', 'name address');

        createdTransactions.push(populatedTransaction);
      } catch (error) {
        errors.push({
          row: i + 1,
          error: error.message || 'Failed to create transaction',
          data: transactionData
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdTransactions.length} transaction(s)${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
      data: {
        created: createdTransactions,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    next(error);
  }
};

