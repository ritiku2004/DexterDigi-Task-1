// backend/models/employee.model.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    fullName:     { type: String, required: true },
    email:        { type: String, required: true, unique: true },
    phone:        { type: String, required: true },
    dob:          { type: Date,   required: true },
    gender:       { type: String, required: true },
    skills:       { type: [String], required: true },
    department:   { type: String, required: true },
    resume:       { type: String, required: true },       // path to PDF
    profileImage: { type: String, required: true },       // path to image
    isActive:     { type: Boolean, default: false },
    address:      { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);
