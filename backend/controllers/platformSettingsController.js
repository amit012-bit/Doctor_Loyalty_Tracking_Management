import PlatformSettings from '../models/PlatformSettings.js';

export const getPlatformSettings = async (req, res, next) => {
  try {
    const settings = await PlatformSettings.getSettings();
    
    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlatformSettings = async (req, res, next) => {
  try {
    const { isEnabled } = req.body;

    if (typeof isEnabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isEnabled must be a boolean value'
      });
    }

    // Get or create settings document
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({ isEnabled });
    } else {
      settings.isEnabled = isEnabled;
      await settings.save();
    }

    res.json({
      success: true,
      message: `Platform ${isEnabled ? 'enabled' : 'disabled'} successfully`,
      data: { settings }
    });
  } catch (error) {
    next(error);
  }
};

