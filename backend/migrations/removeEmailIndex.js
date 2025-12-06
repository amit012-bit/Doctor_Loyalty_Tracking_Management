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
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('User');

    // Check if email_1 index exists
    const indexes = await collection.indexes();
    const emailIndex = indexes.find(idx => idx.name === 'email_1');

    if (emailIndex) {
      console.log('📋 Found email_1 index. Dropping it...');
      await collection.dropIndex('email_1');
      console.log('✅ Successfully dropped email_1 index');
    } else {
      console.log('ℹ️  email_1 index not found. Nothing to do.');
    }

    // Also check for username_1 index and create if it doesn't exist
    const usernameIndex = indexes.find(idx => idx.name === 'username_1');
    if (!usernameIndex) {
      console.log('📋 Creating username_1 unique index...');
      await collection.createIndex({ username: 1 }, { unique: true, name: 'username_1' });
      console.log('✅ Successfully created username_1 unique index');
    } else {
      console.log('ℹ️  username_1 index already exists.');
    }

    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
