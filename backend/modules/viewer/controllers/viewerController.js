const Project = require('../../../database/models/Project');
const DataRow = require('../../../database/models/DataRow');

exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find({}, 'name totalRows createdAt validated validatedAt');
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.validateProject = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        project.validated = true;
        project.validatedAt = new Date();
        await project.save();

        res.status(200).json({ message: 'Project validated successfully', project });
    } catch (error) {
        console.error('Error validating project:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProjectData = async (req, res) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const rows = await DataRow.find({ projectId: id })
            .skip(skip)
            .limit(limit)
            .lean(); // Faster query

        // Extract data + validated status for each row
        const flatRows = rows.map(r => ({ ...r.data, _id: r._id, _validated: r.validated, _validatedAt: r.validatedAt }));

        res.status(200).json({
            project: {
                id: project._id,
                name: project.name,
                headers: project.headers,
                selectedHeaders: project.selectedHeaders,
                totalRows: project.totalRows,
                validated: project.validated,
                validatedAt: project.validatedAt
            },
            data: flatRows,
            page,
            totalPages: Math.ceil(project.totalRows / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.validateRow = async (req, res) => {
    try {
        const { id, rowId } = req.params;

        const row = await DataRow.findOne({ _id: rowId, projectId: id });
        if (!row) {
            return res.status(404).json({ message: 'Row not found' });
        }

        row.validated = true;
        row.validatedAt = new Date();
        await row.save();

        res.status(200).json({ message: 'Row validated successfully', validated: true, validatedAt: row.validatedAt });
    } catch (error) {
        console.error('Error validating row:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
