const express = require('express');
const router = express.Router();
const viewerController = require('./controllers/viewerController');
const authMiddleware = require('../../middlewares/auth');

// Protect routes: Logged in users (Admin/Reviewer) can view
router.get('/projects', authMiddleware, viewerController.getProjects);
router.get('/projects/:id', authMiddleware, viewerController.getProjectData);

module.exports = router;
