// backend/models/employee.model.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    fullName:     { type: String,  required: true },
    email:        { type: String,  required: true, unique: true },
    phone:        { type: String,  required: true },
    dob:          { type: Date,    required: true },
    gender:       { type: String,  required: true },
    skills:       { type: [String],required: true },
    department:   { type: String,  required: true },
    resume:       { type: String,  required: true },         // stored path to PDF
    profileImage: { type: String,  required: true },         // stored path to the image
    galleryImages:{ type: [String], default: [] },           // array of image paths
    address:      { type: String,  required: true },
    isActive:     { type: Boolean, default: true },          // default true to match your toggle
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);
