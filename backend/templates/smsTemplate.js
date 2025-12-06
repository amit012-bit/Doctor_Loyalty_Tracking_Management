export const otpSmsTemplate = (otp) => {
  return `Your OTP is ${otp}. Please share this OTP with the executive when they arrive for delivery verification. This OTP is valid for this transaction only.`;
}

export const loginSmsTemplate = (username, password) => {
  return `Your account has been created successfully in Loyalty Reward Management System. Below are your login credentials:
  Username : ${username}
  Password : ${password}
  URL : ${process.env.FRONTEND_URL}
  Please use this username and password to login to the system. You can reset your username and password from the profile page after login.`;
}

export const transactionSmsTemplate = (transaction, executiveName) => {
  return `Your transaction has been created and an OTP has been generated for verification.
  Your OTP: ${transaction.otp}
  Transaction Details:
  Amount: ₹${transaction.amount}
  Executive: ${executiveName}
  Please share this OTP with the executive when they arrive for delivery verification. This OTP is valid for this transaction only.
  `;
}