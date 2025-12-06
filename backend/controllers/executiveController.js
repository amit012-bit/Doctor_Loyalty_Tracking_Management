import Executive from '../models/Executive.js';
import User from '../models/User.js';
import { loginSmsTemplate } from '../templates/smsTemplate.js';
import sendSMS from '../services/smsSevice.js';

export const getExecutives = async (req, res, next) => {
  try {
    const executives = await Executive.find()
      .populate('locationId', 'name address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: executives.length,
      data: { executives }
    });
  } catch (error) {
    next(error);
  }
};

export const getExecutiveById = async (req, res, next) => {
  try {
    const executive = await Executive.findById(req.params.id)
      .populate('locationId', 'name address');

    if (!executive) {
      return res.status(404).json({
        success: false,
        message: 'Executive not found'
      });
    }

    res.json({
      success: true,
      data: { executive }
    });
  } catch (error) {
    next(error);
  }
};

// Generate random password
const generateRandomPassword = () => {
  const length = 8;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Generate username from name
const generateUsername = (name) => {
  const baseUsername = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
  const randomSuffix = Math.floor(Math.random() * 10000);
  return `${baseUsername}${randomSuffix}`;
};

export const createExecutive = async (req, res, next) => {
  try {
    const { name, phoneNumber, locationId, status } = req.body;

    // Check if executive with same phone number already exists
    const existingExecutive = await Executive.findOne({ phoneNumber });
    if (existingExecutive) {
      return res.status(400).json({
        success: false,
        message: 'Executive with this phone number already exists'
      });
    }

    // Generate username and password
    let username = generateUsername(name);
    // Ensure username is unique (check both Executive and User collections)
    let usernameExists = await Executive.findOne({ username }) || await User.findOne({ username });
    while (usernameExists) {
      username = generateUsername(name);
      usernameExists = await Executive.findOne({ username }) || await User.findOne({ username });
    }

    const password = generateRandomPassword();

    const executive = await Executive.create({
      name,
      username,
      password, // Store password in plain text
      phoneNumber,
      locationId,
      status: status || 'active'
    });

    // Populate location before sending response
    await executive.populate('locationId', 'name address');

    const smsTemplate = loginSmsTemplate(username, password);
    sendSMS(smsTemplate, phoneNumber);

    res.status(201).json({
      success: true,
      message: 'Executive created successfully',
      data: { 
        executive,
        username, // Return generated username
        password  // Return generated password so it can be shared with executive
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Executive with this phone number already exists'
      });
    }
    next(error);
  }
};

export const updateExecutive = async (req, res, next) => {
  try {
    const { name, phoneNumber, locationId, status, username, password } = req.body;

    // Check if phone number is being updated and if it conflicts with another executive
    if (phoneNumber) {
      const existingExecutive = await Executive.findOne({ 
        phoneNumber,
        _id: { $ne: req.params.id }
      });
      if (existingExecutive) {
        return res.status(400).json({
          success: false,
          message: 'Executive with this phone number already exists'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (locationId) updateData.locationId = locationId;
    if (status) updateData.status = status;
    if (username) updateData.username = username;
    if (password) updateData.password = password;

    const executive = await Executive.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('locationId', 'name address');

    if (!executive) {
      return res.status(404).json({
        success: false,
        message: 'Executive not found'
      });
    }

    res.json({
      success: true,
      message: 'Executive updated successfully',
      data: { executive }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteExecutive = async (req, res, next) => {
  try {
    const executive = await Executive.findByIdAndDelete(req.params.id);

    if (!executive) {
      return res.status(404).json({
        success: false,
        message: 'Executive not found'
      });
    }

    res.json({
      success: true,
      message: 'Executive deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

