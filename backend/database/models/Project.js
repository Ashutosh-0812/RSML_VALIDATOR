const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    // Removed 'data' array to avoid 16MB limit. Data is now stored in 'DataRow' collection.
    headers: {
        type: [String], // All headers from CSV
        default: []
    },
    selectedHeaders: {
        type: [String], // Admin-chosen columns to display
        default: []
    },
    customColumns: {
        type: [String], // User-added custom columns
        default: []
    },
    totalRows: {
        type: Number,
        default: 0
    },
    validated: {
        type: Boolean,
        default: false
    },
    validatedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
