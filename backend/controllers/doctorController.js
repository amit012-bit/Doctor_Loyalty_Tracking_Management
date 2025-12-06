import Doctor from '../models/Doctor.js';

export const getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find()
      .populate('locationId', 'name address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: doctors.length,
      data: { doctors }
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('locationId', 'name address');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      data: { doctor }
    });
  } catch (error) {
    next(error);
  }
};

export const createDoctor = async (req, res, next) => {
  try {
    const { name, mobileNumber, clinicName, locationId, status } = req.body;

    // Check if doctor with same mobile number already exists
    const existingDoctor = await Doctor.findOne({ mobileNumber });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor with this mobile number already exists'
      });
    }

    const doctor = await Doctor.create({
      name,
      mobileNumber,
      clinicName,
      locationId,
      status: status || 'active'
    });

    // Populate location before sending response
    await doctor.populate('locationId', 'name address');

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: { doctor }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Doctor with this mobile number already exists'
      });
    }
    next(error);
  }
};

export const updateDoctor = async (req, res, next) => {
  try {
    const { name, mobileNumber, clinicName, locationId, status } = req.body;

    // Check if mobile number is being updated and if it conflicts with another doctor
    if (mobileNumber) {
      const existingDoctor = await Doctor.findOne({ 
        mobileNumber,
        _id: { $ne: req.params.id }
      });
      if (existingDoctor) {
        return res.status(400).json({
          success: false,
          message: 'Doctor with this mobile number already exists'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (mobileNumber) updateData.mobileNumber = mobileNumber;
    if (clinicName) updateData.clinicName = clinicName;
    if (locationId) updateData.locationId = locationId;
    if (status) updateData.status = status;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('locationId', 'name address');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor updated successfully',
      data: { doctor }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

