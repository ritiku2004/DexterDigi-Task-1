// backend/routes/employee.routes.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const router  = express.Router();
const Controller = require('../controllers/employee.controller');

// ——— Multer Setup ———
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (_req, file, cb) => {
  if (file.fieldname === 'resume') {
    return cb(null, file.mimetype === 'application/pdf');
  }
  if (file.fieldname === 'profileImage') {
    return cb(null, file.mimetype.startsWith('image/'));
  }
  cb(null, false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // max 2 MB per file
});

router.get("/view", Controller.getAllEmployees);

router.get('/view/:id', Controller.getEmployeeById);

// — fields: resume + profileImage
router.post(
  '/create',
  upload.fields([
    { name: 'resume',       maxCount: 1 },
    { name: 'profileImage', maxCount: 1 }
  ]),
  Controller.createEmployee
);

// Update employee
router.put(
  "/update/:id",
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 }
  ]),
  Controller.updateEmployee
);

// Delete employee
router.delete("/delete/:id", Controller.deleteEmployee);



module.exports = router;
