import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/database.js';
import User from '../models/User.js';
import Location from '../models/Location.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Transaction.deleteMany({});
    await User.deleteMany({});
    await Location.deleteMany({});

    // Create locations
    console.log('📍 Creating locations...');
    const locations = await Location.insertMany([
      {
        name: 'Mandya',
        address: 'Mandya Main Street, Karnataka'
      },
      {
        name: 'Ramanagara',
        address: 'Ramanagara City Center, Karnataka'
      },
      {
        name: 'K R Pete',
        address: 'K R Pete Town, Karnataka'
      }
    ]);
    console.log(`✅ Created ${locations.length} locations`);

    // Create users
    console.log('👥 Creating users...');
    const users = await User.insertMany([
      {
        name: 'Dr. Rajesh Kumar',
        email: 'doctor1@example.com',
        password: 'doctor123',
        role: 'doctor',
        locationId: locations[0]._id
      },
      {
        name: 'Dr. Priya Sharma',
        email: 'doctor2@example.com',
        password: 'doctor123',
        role: 'doctor',
        locationId: locations[1]._id
      },
      {
        name: 'Dr. Amit Patel',
        email: 'doctor3@example.com',
        password: 'doctor123',
        role: 'doctor',
        locationId: locations[2]._id
      },
      {
        name: 'Executive John',
        email: 'executive1@example.com',
        password: 'executive123',
        role: 'executive',
        locationId: locations[0]._id
      },
      {
        name: 'Executive Sarah',
        email: 'executive2@example.com',
        password: 'executive123',
        role: 'executive',
        locationId: locations[1]._id
      },
      {
        name: 'Executive Mike',
        email: 'executive3@example.com',
        password: 'executive123',
        role: 'executive',
        locationId: locations[2]._id
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        locationId: locations[0]._id
      },
      {
        name: 'Super Admin',
        email: 'superadmin@example.com',
        password: 'superadmin123',
        role: 'superadmin',
        locationId: locations[0]._id
      },
      {
        name: 'Accountant User',
        email: 'accountant@example.com',
        password: 'accountant123',
        role: 'accountant',
        locationId: locations[0]._id
      }
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Get doctors and executives
    const doctors = users.filter(u => u.role === 'doctor');
    const executives = users.filter(u => u.role === 'executive');

    // Create transactions
    console.log('💰 Creating transactions...');
    const transactions = [];
    
    const statuses = ['completed', 'IN progress', 'pending'];
    const paymentModes = ['Cash', 'Online Transfer'];
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const currentYear = new Date().getFullYear();

    // Create 50 dummy transactions
    for (let i = 0; i < 50; i++) {
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const executive = executives[Math.floor(Math.random() * executives.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];
      const month = months[Math.floor(Math.random() * months.length)];
      const monthYear = `${month}/${currentYear}`;
      const amount = Math.floor(Math.random() * 50000) + 5000; // Random amount between 5000 and 55000
      
      const deliveryDate = status === 'completed' 
        ? new Date(currentYear, parseInt(month) - 1, Math.floor(Math.random() * 28) + 1)
        : null;

      transactions.push({
        doctorId: doctor._id,
        executiveId: executive._id,
        locationId: location._id,
        amount,
        paymentMode,
        monthYear,
        status,
        deliveryDate
      });
    }

    await Transaction.insertMany(transactions);
    console.log(`✅ Created ${transactions.length} transactions`);

    console.log('\n🎉 Seed data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Locations: ${locations.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Transactions: ${transactions.length}`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Doctor: doctor1@example.com / doctor123');
    console.log('   Executive: executive1@example.com / executive123');
    console.log('   Admin: admin@example.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

