import Location from '../models/Location.js';

export const getLocations = async (req, res, next) => {
  try {
    const locations = await Location.find().sort({ name: 1 });

    res.json({
      success: true,
      count: locations.length,
      data: { locations }
    });
  } catch (error) {
    next(error);
  }
};

export const getLocationById = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      data: { location }
    });
  } catch (error) {
    next(error);
  }
};

export const createLocation = async (req, res, next) => {
  try {
    const { name, address } = req.body;

    const location = await Location.create({
      name,
      address
    });

    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: { location }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Location with this name already exists'
      });
    }
    next(error);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const { name, address } = req.body;

    const location = await Location.findByIdAndUpdate(
      req.params.id,
      { name, address },
      { new: true, runValidators: true }
    );

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: { location }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLocation = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

