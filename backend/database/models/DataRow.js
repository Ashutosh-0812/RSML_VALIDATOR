const mongoose = require('mongoose');

const dataRowSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true // Index for faster queries by project
    },
    data: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('DataRow', dataRowSchema);
