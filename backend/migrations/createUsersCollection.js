import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined. Please set it in your .env file.');
  process.exit(1);
}

const USERS_COLLECTION = 'users';

// JSON schema validator that mirrors backend/models/User.js
const userValidator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name', 'email', 'password', 'role'],
    additionalProperties: false,
    properties: {
      _id: { bsonType: 'objectId' },
      name: {
        bsonType: 'string',
        minLength: 2,
        maxLength: 50,
        description: 'Name must be between 2 and 50 characters'
      },
      email: {
        bsonType: 'string',
        pattern: '^\\S+@\\S+\\.\\S+$',
        description: 'Email must be valid'
      },
      password: {
        bsonType: 'string',
        minLength: 6,
        description: 'Password must be at least 6 characters'
      },
      role: {
        enum: ['admin', 'doctor', 'executive'],
        description: 'Role must be admin, doctor, or executive'
      },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' }
    }
  }
};

const runMigration = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    const existing = await db.listCollections({ name: USERS_COLLECTION }).toArray();

    if (existing.length > 0) {
      console.log(`⚠️  Collection "${USERS_COLLECTION}" already exists. Updating validator...`);
      await db.command({
        collMod: USERS_COLLECTION,
        validator: userValidator,
        validationLevel: 'strict',
        validationAction: 'error'
      });
      console.log('✅ Validator updated successfully.');
    } else {
      console.log(`🚧 Creating collection "${USERS_COLLECTION}"...`);
      await db.createCollection(USERS_COLLECTION, {
        validator: userValidator,
        validationLevel: 'strict',
        validationAction: 'error'
      });
      console.log('✅ Collection created successfully.');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

runMigration();

