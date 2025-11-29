import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/database.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const fixPassword = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Find the superadmin user
    const superadmin = await User.findOne({ email: 'superadmin@example.com' });
    
    if (!superadmin) {
      console.log('❌ Superadmin user not found');
      process.exit(1);
    }

    console.log('🔍 Found superadmin user');
    console.log('   Current password field type:', typeof superadmin.password);
    
    // Update the password - setting it will trigger the pre-save hook to hash it
    superadmin.password = 'superadmin123';
    await superadmin.save();
    
    console.log('✅ Password has been hashed successfully!');
    console.log('📧 Email: superadmin@example.com');
    console.log('🔑 Password: superadmin123');
    console.log('   (Password is now properly hashed in the database)');

    // Verify by checking if password comparison works
    const testComparison = await superadmin.comparePassword('superadmin123');
    console.log('✅ Password verification test:', testComparison ? 'PASSED' : 'FAILED');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing password:', error.message);
    process.exit(1);
  }
};

fixPassword();

