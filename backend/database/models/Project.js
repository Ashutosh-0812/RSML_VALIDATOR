const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    // Removed 'data' array to avoid 16MB limit. Data is now stored in 'DataRow' collection.
    headers: {
        type: [String], // Store headers for frontend to setup grid columns
        default: []
    },
    totalRows: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
