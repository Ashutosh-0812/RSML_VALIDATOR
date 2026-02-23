const mongoose = require('mongoose');

const dataRowSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true
    },
    data: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        required: true
    },
    validated: {
        type: Boolean,
        default: false
    },
    validatedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('DataRow', dataRowSchema);
