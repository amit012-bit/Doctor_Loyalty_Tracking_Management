import mongoose from 'mongoose';

/**
 * Platform Settings Schema
 * Stores platform-wide settings like enable/disable status
 */
const platformSettingsSchema = new mongoose.Schema({
  isEnabled: {
    type: Boolean,
    default: true,
    required: true
  }
}, {
  timestamps: true
});

// Ensure only one document exists
platformSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({ isEnabled: true });
  }
  return settings;
};

const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema);

export default PlatformSettings;

