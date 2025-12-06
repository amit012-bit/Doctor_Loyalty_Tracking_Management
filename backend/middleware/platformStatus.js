import PlatformSettings from '../models/PlatformSettings.js';

/**
 * Platform Status Middleware
 * Blocks executives from accessing the application when platform is disabled
 * Admins, superadmins, and accountants can always access
 */
export const checkPlatformStatus = async (req, res, next) => {
  try {
    // Skip check for platform settings endpoints (to allow enabling/disabling)
    if (req.path.includes('/platform-settings')) {
      return next();
    }

    // Skip check for login endpoint (we'll check it in login controller)
    if (req.path.includes('/login')) {
      return next();
    }

    // Skip if user is not authenticated (will be handled by authenticate middleware)
    if (!req.user) {
      return next();
    }

    // Get platform settings
    const settings = await PlatformSettings.getSettings();

    // If platform is enabled, allow all users
    if (settings.isEnabled) {
      return next();
    }

    // If platform is disabled, only allow admin, superadmin, and accountant
    if (['admin', 'superadmin'].includes(req.user.role)) {
      return next();
    }

    // Block executives and other users when platform is disabled
    return res.status(503).json({
      success: false,
      message: 'Platform is currently disabled. Please contact your administrator.',
      platformDisabled: true
    });
  } catch (error) {
    // If there's an error checking platform status, allow the request to proceed
    // This prevents the middleware from breaking the app if there's a DB issue
    console.error('Error checking platform status:', error);
    next();
  }
};

