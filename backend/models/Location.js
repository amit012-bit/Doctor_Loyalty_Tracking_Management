import mongoose from 'mongoose';

/**
 * Location Schema
 * Represents a location in the system
 */
const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Location name cannot exceed 100 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

const Location = mongoose.model('Location', locationSchema);

export default Location;

