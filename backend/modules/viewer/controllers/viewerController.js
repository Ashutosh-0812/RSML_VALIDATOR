const Project = require('../../../database/models/Project');
const DataRow = require('../../../database/models/DataRow');

exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find({}, 'name totalRows createdAt');
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
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

        // Extract just the data part for easier frontend consumption
        const flatRows = rows.map(r => ({ ...r.data, _id: r._id }));

        res.status(200).json({
            project: {
                id: project._id,
                name: project.name,
                headers: project.headers,
                totalRows: project.totalRows
            },
            data: flatRows,
            page,
            totalPages: Math.ceil(project.totalRows / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
