/**
 * Location Constants
 * Define all available locations in the system
 * Since there are only 3 locations, we store them as constants instead of a collection
 */
export const LOCATIONS = {
  LOCATION_1: {
    id: '1',
    name: 'Mandya',
  },
  LOCATION_2: {
    id: '2',
    name: 'Ramanagara'
  },
  LOCATION_3: {
    id: '3',
    name: 'K R Pete'
  }
};

/**
 * Get all locations as an array
 * @returns {Array} Array of location objects
 */
export const getAllLocations = () => {
  return Object.values(LOCATIONS);
};

/**
 * Get location by ID
 * @param {string} locationId - Location ID
 * @returns {Object|null} Location object or null if not found
 */
export const getLocationById = (locationId) => {
  return getAllLocations().find(loc => loc.id === locationId) || null;
};

/**
 * Get location IDs as an array (for enum validation)
 * @returns {Array<string>} Array of location IDs
 */
export const getLocationIds = () => {
  return getAllLocations().map(loc => loc.id);
};

