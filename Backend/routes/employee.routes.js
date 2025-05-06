// backend/routes/employee.routes.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const router  = express.Router();
const Controller = require('../controllers/employee.controller');

// Multer storage & filter
const storage = multer.diskStorage({
  destination: (_req, _file, cb) =>
    cb(null, path.join(__dirname, '../uploads')),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.fieldname === 'resume') {
    cb(null, file.mimetype === 'application/pdf');
  } else {
    // profileImage or galleryImages
    cb(null, file.mimetype.startsWith('image/'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max per file
});

router.get("/view", Controller.getAllEmployees);

router.get('/view/:id', Controller.getEmployeeById);

// — fields: resume + profileImage
router.post(
  '/create',
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 }, // adjust maxCount as needed
  ]),
  Controller.createEmployee
);


router.put(
  '/update/:id',
  upload.fields([
    { name: 'resume',       maxCount: 1 },
    { name: 'profileImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 },
  ]),
  Controller.updateEmployee
);

// Delete employee
router.delete("/delete/:id", Controller.deleteEmployee);



module.exports = router;
