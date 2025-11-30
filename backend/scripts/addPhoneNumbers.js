import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/database.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const addPhoneNumbers = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Get all users without phone numbers
    const usersWithoutPhone = await User.find({ 
      $or: [
        { phoneNumber: { $exists: false } },
        { phoneNumber: null },
        { phoneNumber: '' }
      ]
    });

    console.log(`📋 Found ${usersWithoutPhone.length} users without phone numbers`);

    if (usersWithoutPhone.length === 0) {
      console.log('✅ All users already have phone numbers!');
      process.exit(0);
    }

    // Default phone numbers based on email/role (format: +91-XXXXXXXXXX)
    const defaultPhones = {
      'superadmin@example.com': '+91-9876543217',
      'admin@example.com': '+91-9876543216',
      'accountant@example.com': '+91-9876543218',
      'doctor1@example.com': '+91-9876543210',
      'doctor2@example.com': '+91-9876543211',
      'doctor3@example.com': '+91-9876543212',
      'executive1@example.com': '+91-9876543213',
      'executive2@example.com': '+91-9876543214',
      'executive3@example.com': '+91-9876543215',
    };

    let updated = 0;
    let skipped = 0;

    for (const user of usersWithoutPhone) {
      // Check if we have a default phone for this user
      const defaultPhone = defaultPhones[user.email];
      
      if (defaultPhone) {
        user.phoneNumber = defaultPhone;
        await user.save();
        console.log(`✅ Updated ${user.name} (${user.email}): ${defaultPhone}`);
        updated++;
      } else {
        // Generate a default phone number (10 digits starting with 6-9)
        const firstDigit = Math.floor(6 + Math.random() * 4); // 6, 7, 8, or 9
        const remainingDigits = Math.floor(100000000 + Math.random() * 900000000); // 9 more digits
        const phoneNumber = `${firstDigit}${remainingDigits.toString().padStart(9, '0')}`;
        const defaultPhone = `+91-${phoneNumber}`;
        user.phoneNumber = defaultPhone;
        await user.save();
        console.log(`✅ Updated ${user.name} (${user.email}): ${defaultPhone} (generated)`);
        updated++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Updated: ${updated} users`);
    console.log(`   - Skipped: ${skipped} users`);
    console.log(`\n✅ Phone numbers added successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding phone numbers:', error.message);
    process.exit(1);
  }
};

addPhoneNumbers();

