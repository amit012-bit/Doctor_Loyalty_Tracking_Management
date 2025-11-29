import nodemailer from 'nodemailer';

/**
 * Create and configure email transporter
 */
const createTransporter = () => {
  // Check if email is disabled
  if (process.env.DISABLE_EMAIL === 'true') {
    console.log('📧 Email service is disabled (DISABLE_EMAIL=true)');
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  return transporter;
};

/**
 * Send OTP email to doctor
 * @param {string} doctorEmail - Doctor's email address
 * @param {string} otp - 6-digit OTP code
 * @param {Object} transactionDetails - Transaction details for email content
 * @returns {Promise<Object>} - Email sending result
 */
export const sendOTPEmail = async (doctorEmail, otp, transactionDetails = {}) => {
  try {
    // Check if email is disabled
    if (process.env.DISABLE_EMAIL === 'true') {
      console.log('📧 Email service is disabled. OTP would have been sent to:', doctorEmail);
      return { success: true, message: 'Email disabled (testing mode)' };
    }

    // Validate required email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('❌ Email configuration missing. Please set EMAIL_USER and EMAIL_PASSWORD in .env');
      throw new Error('Email configuration is missing');
    }

    if (!doctorEmail || !otp) {
      throw new Error('Doctor email and OTP are required');
    }

    const transporter = createTransporter();
    
    if (!transporter) {
      throw new Error('Email transporter could not be created');
    }

    // Prepare email content
    const emailSubject = 'Your Transaction OTP - Doctor Loyalty Rewards';
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            border: 1px solid #ddd;
          }
          .header {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 30px;
          }
          .otp-box {
            background-color: #3498db;
            color: white;
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            letter-spacing: 5px;
            margin: 30px 0;
          }
          .info {
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #7f8c8d;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Doctor Loyalty Rewards</h1>
          </div>
          
          <p>Dear Doctor,</p>
          
          <p>A new transaction has been created and an OTP has been generated for verification.</p>
          
          <div class="otp-box">
            ${otp}
          </div>
          
          <div class="info">
            <p><strong>Transaction Details:</strong></p>
            ${transactionDetails.amount ? `<p>Amount: ₹${transactionDetails.amount}</p>` : ''}
            ${transactionDetails.paymentMode ? `<p>Payment Mode: ${transactionDetails.paymentMode}</p>` : ''}
            ${transactionDetails.monthYear ? `<p>Period: ${transactionDetails.monthYear}</p>` : ''}
          </div>
          
          <div class="warning">
            <p><strong>Important:</strong> Please share this OTP with the executive when they arrive for delivery verification.</p>
          </div>
          
          <p>This OTP is valid for this transaction only.</p>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Doctor Loyalty Rewards System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
Doctor Loyalty Rewards - Transaction OTP

Dear Doctor,

A new transaction has been created and an OTP has been generated for verification.

Your OTP: ${otp}

Transaction Details:
${transactionDetails.amount ? `Amount: ₹${transactionDetails.amount}` : ''}
${transactionDetails.paymentMode ? `Payment Mode: ${transactionDetails.paymentMode}` : ''}
${transactionDetails.monthYear ? `Period: ${transactionDetails.monthYear}` : ''}

Important: Please share this OTP with the executive when they arrive for delivery verification.

This OTP is valid for this transaction only.

This is an automated message. Please do not reply to this email.
    `.trim();

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: doctorEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHTML
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ OTP email sent successfully to:', doctorEmail);
    console.log('📧 Message ID:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'OTP email sent successfully'
    };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    throw error;
  }
};

/**
 * Send transaction completion email to doctor and executive
 * @param {string} doctorEmail - Doctor's email address
 * @param {string} executiveEmail - Executive's email address
 * @param {Object} transactionDetails - Transaction details for email content
 * @returns {Promise<Object>} - Email sending result
 */
export const sendCompletionEmail = async (doctorEmail, executiveEmail, transactionDetails = {}) => {
  try {
    // Check if email is disabled
    if (process.env.DISABLE_EMAIL === 'true') {
      console.log('📧 Email service is disabled. Completion emails would have been sent.');
      return { success: true, message: 'Email disabled (testing mode)' };
    }

    // Validate required email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('❌ Email configuration missing. Please set EMAIL_USER and EMAIL_PASSWORD in .env');
      throw new Error('Email configuration is missing');
    }

    if (!doctorEmail && !executiveEmail) {
      throw new Error('At least one email (doctor or executive) is required');
    }

    const transporter = createTransporter();
    
    if (!transporter) {
      throw new Error('Email transporter could not be created');
    }

    const results = [];

    // Send email to doctor if email is provided
    if (doctorEmail) {
      const doctorEmailSubject = 'Transaction Completed - Doctor Loyalty Rewards';
      const doctorEmailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              border: 1px solid #ddd;
            }
            .header {
              text-align: center;
              color: #27ae60;
              margin-bottom: 30px;
            }
            .success-badge {
              background-color: #27ae60;
              color: white;
              font-size: 24px;
              font-weight: bold;
              text-align: center;
              padding: 20px;
              border-radius: 8px;
              margin: 30px 0;
            }
            .info {
              background-color: #fff;
              padding: 20px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .info-label {
              font-weight: bold;
              color: #555;
            }
            .footer {
              text-align: center;
              color: #7f8c8d;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Doctor Loyalty Rewards</h1>
            </div>
            
            <div class="success-badge">
              ✅ Transaction Completed Successfully
            </div>
            
            <p>Dear Doctor,</p>
            
            <p>Your transaction has been successfully completed and verified. Thank you for your cooperation.</p>
            
            <div class="info">
              <h3>Transaction Details:</h3>
              ${transactionDetails.amount ? `
                <div class="info-row">
                  <span class="info-label">Amount:</span>
                  <span>₹${transactionDetails.amount}</span>
                </div>
              ` : ''}
              ${transactionDetails.paymentMode ? `
                <div class="info-row">
                  <span class="info-label">Payment Mode:</span>
                  <span>${transactionDetails.paymentMode}</span>
                </div>
              ` : ''}
              ${transactionDetails.monthYear ? `
                <div class="info-row">
                  <span class="info-label">Period:</span>
                  <span>${transactionDetails.monthYear}</span>
                </div>
              ` : ''}
              ${transactionDetails.locationName ? `
                <div class="info-row">
                  <span class="info-label">Location:</span>
                  <span>${transactionDetails.locationName}</span>
                </div>
              ` : ''}
              ${transactionDetails.deliveryDate ? `
                <div class="info-row">
                  <span class="info-label">Delivery Date:</span>
                  <span>${new Date(transactionDetails.deliveryDate).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              ` : ''}
            </div>
            
            <p>Your loyalty reward transaction has been processed and completed. We appreciate your continued partnership.</p>
            
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Doctor Loyalty Rewards System</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const doctorEmailText = `
Doctor Loyalty Rewards - Transaction Completed

Dear Doctor,

Your transaction has been successfully completed and verified. Thank you for your cooperation.

Transaction Details:
${transactionDetails.amount ? `Amount: ₹${transactionDetails.amount}` : ''}
${transactionDetails.paymentMode ? `Payment Mode: ${transactionDetails.paymentMode}` : ''}
${transactionDetails.monthYear ? `Period: ${transactionDetails.monthYear}` : ''}
${transactionDetails.locationName ? `Location: ${transactionDetails.locationName}` : ''}
${transactionDetails.deliveryDate ? `Delivery Date: ${new Date(transactionDetails.deliveryDate).toLocaleString('en-IN')}` : ''}

Your loyalty reward transaction has been processed and completed. We appreciate your continued partnership.

This is an automated message. Please do not reply to this email.
      `.trim();

      const doctorMailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: doctorEmail,
        subject: doctorEmailSubject,
        text: doctorEmailText,
        html: doctorEmailHTML
      };

      const doctorInfo = await transporter.sendMail(doctorMailOptions);
      results.push({ recipient: 'doctor', email: doctorEmail, messageId: doctorInfo.messageId });
      console.log('✅ Completion email sent to doctor:', doctorEmail);
    }

    // Send email to executive if email is provided
    if (executiveEmail) {
      const executiveEmailSubject = 'Transaction Completed - Delivery Confirmation';
      const executiveEmailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              border: 1px solid #ddd;
            }
            .header {
              text-align: center;
              color: #27ae60;
              margin-bottom: 30px;
            }
            .success-badge {
              background-color: #27ae60;
              color: white;
              font-size: 24px;
              font-weight: bold;
              text-align: center;
              padding: 20px;
              border-radius: 8px;
              margin: 30px 0;
            }
            .info {
              background-color: #fff;
              padding: 20px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .info-label {
              font-weight: bold;
              color: #555;
            }
            .footer {
              text-align: center;
              color: #7f8c8d;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Doctor Loyalty Rewards</h1>
            </div>
            
            <div class="success-badge">
              ✅ Transaction Completed Successfully
            </div>
            
            <p>Dear Executive,</p>
            
            <p>The transaction has been successfully completed and verified. Great job on completing the delivery!</p>
            
            <div class="info">
              <h3>Transaction Details:</h3>
              ${transactionDetails.doctorName ? `
                <div class="info-row">
                  <span class="info-label">Doctor:</span>
                  <span>${transactionDetails.doctorName}</span>
                </div>
              ` : ''}
              ${transactionDetails.amount ? `
                <div class="info-row">
                  <span class="info-label">Amount:</span>
                  <span>₹${transactionDetails.amount}</span>
                </div>
              ` : ''}
              ${transactionDetails.paymentMode ? `
                <div class="info-row">
                  <span class="info-label">Payment Mode:</span>
                  <span>${transactionDetails.paymentMode}</span>
                </div>
              ` : ''}
              ${transactionDetails.monthYear ? `
                <div class="info-row">
                  <span class="info-label">Period:</span>
                  <span>${transactionDetails.monthYear}</span>
                </div>
              ` : ''}
              ${transactionDetails.locationName ? `
                <div class="info-row">
                  <span class="info-label">Location:</span>
                  <span>${transactionDetails.locationName}</span>
                </div>
              ` : ''}
              ${transactionDetails.deliveryDate ? `
                <div class="info-row">
                  <span class="info-label">Delivery Date:</span>
                  <span>${new Date(transactionDetails.deliveryDate).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              ` : ''}
            </div>
            
            <p>The OTP has been successfully verified and the transaction is now marked as completed. Thank you for your service!</p>
            
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Doctor Loyalty Rewards System</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const executiveEmailText = `
Doctor Loyalty Rewards - Transaction Completed

Dear Executive,

The transaction has been successfully completed and verified. Great job on completing the delivery!

Transaction Details:
${transactionDetails.doctorName ? `Doctor: ${transactionDetails.doctorName}` : ''}
${transactionDetails.amount ? `Amount: ₹${transactionDetails.amount}` : ''}
${transactionDetails.paymentMode ? `Payment Mode: ${transactionDetails.paymentMode}` : ''}
${transactionDetails.monthYear ? `Period: ${transactionDetails.monthYear}` : ''}
${transactionDetails.locationName ? `Location: ${transactionDetails.locationName}` : ''}
${transactionDetails.deliveryDate ? `Delivery Date: ${new Date(transactionDetails.deliveryDate).toLocaleString('en-IN')}` : ''}

The OTP has been successfully verified and the transaction is now marked as completed. Thank you for your service!

This is an automated message. Please do not reply to this email.
      `.trim();

      const executiveMailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: executiveEmail,
        subject: executiveEmailSubject,
        text: executiveEmailText,
        html: executiveEmailHTML
      };

      const executiveInfo = await transporter.sendMail(executiveMailOptions);
      results.push({ recipient: 'executive', email: executiveEmail, messageId: executiveInfo.messageId });
      console.log('✅ Completion email sent to executive:', executiveEmail);
    }

    return {
      success: true,
      results: results,
      message: `Completion emails sent to ${results.length} recipient(s)`
    };
  } catch (error) {
    console.error('❌ Error sending completion emails:', error.message);
    throw error;
  }
};

/**
 * Verify email transporter configuration
 * @returns {Promise<boolean>} - True if configuration is valid
 */
export const verifyEmailConfig = async () => {
  try {
    if (process.env.DISABLE_EMAIL === 'true') {
      console.log('📧 Email service is disabled');
      return true;
    }

    const transporter = createTransporter();
    if (!transporter) {
      return false;
    }

    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};

