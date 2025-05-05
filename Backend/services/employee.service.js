// backend/services/employee.service.js
const Employee = require('../models/employee.model');

exports.createEmployee = async data => {
  const emp = new Employee(data);
  return await emp.save();
};
