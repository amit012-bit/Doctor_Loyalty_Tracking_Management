import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined. Please set it in your .env file.');
  process.exit(1);
}

const runMigration = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log('🔍 Checking for email index in User collection...');
    
    const collection = db.collection('users');
    const indexes = await collection.indexes();
    
    console.log('📋 Current indexes:', indexes.map(idx => idx.name));
    
    // Find and drop the email index
    const emailIndex = indexes.find(idx => idx.key && idx.key.email);
    
    if (emailIndex) {
      console.log(`🗑️  Dropping email index: ${emailIndex.name}`);
      await collection.dropIndex(emailIndex.name);
      console.log('✅ Email index dropped successfully.');
    } else {
      console.log('ℹ️  No email index found. Nothing to drop.');
    }
    
    // Verify username index exists
    const usernameIndex = indexes.find(idx => idx.key && idx.key.username);
    if (!usernameIndex) {
      console.log('📝 Creating username index...');
      await collection.createIndex({ username: 1 }, { unique: true });
      console.log('✅ Username index created successfully.');
    } else {
      console.log('✅ Username index already exists.');
    }
    
    console.log('✅ Migration completed successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

runMigration();

