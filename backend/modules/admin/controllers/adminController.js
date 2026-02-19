const csvService = require('../services/csvService');

const Project = require('../../../database/models/Project');
const DataRow = require('../../../database/models/DataRow');

exports.uploadCsv = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { projectName } = req.body;
        if (!projectName) {
            return res.status(400).json({ message: 'Project name is required' });
        }

        const project = await csvService.processCsvUpload(req.file, projectName);
        res.status(201).json({ message: 'Project created and CSV parsed successfully', project });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Delete all associated data rows
        await DataRow.deleteMany({ projectId: id });

        // Delete the project
        await Project.findByIdAndDelete(id);

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
