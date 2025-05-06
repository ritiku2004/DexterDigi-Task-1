// backend/controllers/employee.controller.js
const EmployeeService = require('../services/employee.service');
const Employee = require("../models/employee.model");
const mongoose = require('mongoose');
const fs = require("fs");
const path = require("path");

exports.createEmployee = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      dob,
      gender,
      department,
      address,
    } = req.body;
    let { skills, isActive } = req.body;

    // Required fields
    if (
      !fullName ||
      !email ||
      !phone ||
      !dob ||
      !gender ||
      !skills ||
      !department ||
      !address
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required' });
    }

    // resume & profileImage must be uploaded
    if (!req.files?.resume?.[0] || !req.files?.profileImage?.[0]) {
      return res.status(400).json({
        success: false,
        message: 'Resume and Profile Image are required',
      });
    }

    // parse skills (string or array)
    if (typeof skills === 'string') {
      skills = skills.split(',').map((s) => s.trim());
    }

    // build payload
    const payload = {
      fullName,
      email,
      phone,
      dob,
      gender,
      skills,
      department,
      resume: `${req.files.resume[0].filename}`,
      profileImage: `uploads/${req.files.profileImage[0].filename}`,
      // galleryImages might be undefined if none uploaded
      galleryImages: (req.files.galleryImages || []).map(
        (file) => `uploads/${file.filename}`
      ),
      isActive: isActive === 'true' || isActive === true,
      address,
    };

    const employee = await EmployeeService.createEmployee(payload);
    return res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: employee,
    });
  } catch (err) {
    // duplicate email
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already exists' });
    }
    next(err);
  }
};

// Get all employee profiles
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Server error while fetching employees." });
  }
};

// Get employee profile
exports.getEmployeeById = async (req, res) => {
  const { id } = req.params;

  // Check if it's a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid employee ID' });
  }

  try {
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({ employee });
  } catch (err) {
    console.error('Error fetching employee:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete employee by ID
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Employee.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({ success: true, message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ success: false, message: "Server error while deleting employee" });
  }
};


exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      fullName,
      email,
      phone,
      dob,
      gender,
      department,
      address,
      isActive,
      skills,
      existingGalleryImages,
    } = req.body;

    if (typeof skills === 'string') {
      skills = skills.split(',').map((s) => s.trim());
    }

    let gallery = [];
    if (existingGalleryImages) {
      gallery = Array.isArray(existingGalleryImages)
        ? existingGalleryImages
        : [existingGalleryImages];
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const uploadsDir = path.resolve(__dirname, '../uploads');

    // 1. Delete old profile image if replaced
    if (req.files?.profileImage?.[0]) {
      if (employee.profileImage) {
        const profileImagePath = path.join(uploadsDir, path.basename(employee.profileImage));
        if (fs.existsSync(profileImagePath)) {
          fs.unlinkSync(profileImagePath);
        }
      }
    }

    // 2. Delete removed gallery images
    const oldGallery = employee.galleryImages || [];
    const removed = oldGallery.filter((img) => !gallery.includes(img));
    removed.forEach((img) => {
      const imgPath = path.join(uploadsDir, path.basename(img));
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    });

    // 3. Build update object
    const updateData = {
      fullName,
      email,
      phone,
      dob,
      gender,
      department,
      address,
      skills,
      isActive: isActive === 'true' || isActive === true,
    };

    if (req.files?.resume?.[0]) {
      updateData.resume = `${req.files.resume[0].filename}`;
    }

    if (req.files?.profileImage?.[0]) {
      updateData.profileImage = `uploads/${req.files.profileImage[0].filename}`;
    }

    const newGallery = (req.files.galleryImages || []).map(
      (file) => `uploads/${file.filename}`
    );
    updateData.galleryImages = [...gallery, ...newGallery];

    const updated = await Employee.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating employee',
    });
  }
};
