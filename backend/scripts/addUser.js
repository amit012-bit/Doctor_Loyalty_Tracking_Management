import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/database.js';
import User from '../models/User.js';
import Location from '../models/Location.js';

// Load environment variables (dotenv.config() looks for .env in parent directories automatically)
// But we'll explicitly set the path to backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const addUser = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Get first location (or create one if none exists)
    let location = await Location.findOne();
    if (!location) {
      console.log('📍 No location found, creating default location...');
      location = await Location.create({
        name: 'Mandya',
        address: 'Mandya Main Street, Karnataka'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'test@gmail.com' });
    if (existingUser) {
      console.log('⚠️  User with email test@gmail.com already exists. Updating password...');
      existingUser.password = 'sindhu@123';
      await existingUser.save();
      console.log('✅ User password updated successfully!');
      console.log('📧 Email: test@gmail.com');
      console.log('🔑 Password: sindhu@123');
      console.log('👤 Name:', existingUser.name);
      console.log('🎭 Role:', existingUser.role);
      process.exit(0);
    }

    // Create new user
    console.log('👤 Creating user...');
    const user = await User.create({
      name: 'Test User',
      email: 'test@gmail.com',
      password: 'sindhu@123',
      role: 'doctor',
      locationId: location._id
    });

    console.log('✅ User created successfully!');
    console.log('📧 Email: test@gmail.com');
    console.log('🔑 Password: sindhu@123');
    console.log('👤 Name:', user.name);
    console.log('🎭 Role:', user.role);
    console.log('📍 Location:', location.name);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding user:', error.message);
    process.exit(1);
  }
};

addUser();

