const express = require('express');
const router = express.Router();
const adminController = require('./controllers/adminController');
const authMiddleware = require('../../middlewares/auth');
const roleMiddleware = require('../../middlewares/role');
const upload = require('../../middlewares/upload');

// Protect route: Only Admin can upload
router.post('/upload',
    authMiddleware,
    roleMiddleware(['admin']),
    upload.single('file'),
    adminController.uploadCsv
);

// Protect route: Only Admin can delete
router.delete('/projects/:id',
    authMiddleware,
    roleMiddleware(['admin']),
    adminController.deleteProject
);

module.exports = router;
