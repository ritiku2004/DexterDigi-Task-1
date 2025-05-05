// backend/controllers/employee.controller.js
const EmployeeService = require('../services/employee.service');
const Employee = require("../models/employee.model");
const mongoose = require('mongoose');
exports.createEmployee = async (req, res, next) => {
  try {
    // multer puts files in req.files
    const { fullName, email, phone, dob, gender,
            department, address } = req.body;
    let { skills, isActive } = req.body;

    // basic required‑field check
    if (!fullName || !email || !phone || !dob || !gender
        || !skills || !department || !address) {
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required' });
    }

    // resume & profileImage must be uploaded
    if (!req.files?.resume?.[0] || !req.files?.profileImage?.[0]) {
      return res
        .status(400)
        .json({ success: false, message: 'Resume and Profile Image are required' });
    }

    // parse skills (could be single or array)
    if (typeof skills === 'string') {
      skills = skills.split(',').map(s => s.trim());
    }

    // build object for DB
    const payload = {
      fullName,
      email,
      phone,
      dob,
      gender,
      skills,
      department,
      resume:       req.files.resume[0].filename,
      profileImage: `uploads/${req.files.profileImage[0].filename}`,
      isActive:     isActive === 'true' || isActive === true,
      address,
    };

    const employee = await EmployeeService.createEmployee(payload);
    res
      .status(201)
      .json({ success: true, message: 'Profile created successfully', data: employee });
  } catch (err) {
    // duplicate email?
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

// Update employee by ID
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    let { fullName, email, phone, dob, gender, department, address, skills, isActive } = req.body;

    if (typeof skills === 'string') {
      skills = skills.split(',').map(s => s.trim());
    }

    const updateData = {
      fullName,
      email,
      phone,
      dob,
      gender,
      skills,
      department,
      address,
      isActive: isActive === 'true' || isActive === true,
    };

    // If files are updated
    if (req.files?.resume?.[0]) {
      updateData.resume = req.files.resume[0].path;
    }
    if (req.files?.profileImage?.[0]) {
      updateData.profileImage = `uploads/${req.files.profileImage[0].filename}`;
    }

    const updated = await Employee.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({ success: true, message: "Employee updated successfully", data: updated });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ success: false, message: "Server error while updating employee" });
  }
};
