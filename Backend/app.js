// backend/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const employeeRoutes = require('./routes/employee.routes');

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve uploaded files
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// --- Routes ---
app.use('/api/employees', employeeRoutes);

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message || 'Server Error' });
});

module.exports = app;
