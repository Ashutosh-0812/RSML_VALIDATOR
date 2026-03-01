const express = require('express');
const router = express.Router();
const viewerController = require('./controllers/viewerController');
const authMiddleware = require('../../middlewares/auth');
const roleMiddleware = require('../../middlewares/role');

// Protect routes: Logged in users (Admin/Reviewer) can view
router.get('/projects', authMiddleware, viewerController.getProjects);
router.get('/projects/:id', authMiddleware, viewerController.getProjectData);

// Validate a project: Admin and Reviewer can validate
router.put('/projects/:id/validate', authMiddleware, roleMiddleware(['admin', 'reviewer']), viewerController.validateProject);

// Validate a single row/segment: Admin and Reviewer
router.put('/projects/:id/rows/:rowId/validate', authMiddleware, roleMiddleware(['admin', 'reviewer']), viewerController.validateRow);

// Custom columns: add / remove (any authenticated user)
router.post('/projects/:id/custom-columns', authMiddleware, viewerController.addCustomColumn);
router.delete('/projects/:id/custom-columns/:colName', authMiddleware, viewerController.removeCustomColumn);

// Regular cell value: update (for RSML and other regular columns)
router.put('/projects/:id/rows/:rowId/cell', authMiddleware, viewerController.updateRowCell);

// Custom cell value: update
router.put('/projects/:id/rows/:rowId/custom-cell', authMiddleware, viewerController.updateCustomCell);

module.exports = router;
