const mongoose = require('mongoose');
const dotenv = require('dotenv');
const DataRow = require('./database/models/DataRow'); // Adjust path
const Project = require('./database/models/Project'); // Adjust path
const connectDB = require('./database/connection');

dotenv.config();

const testInsert = async () => {
    try {
        await connectDB();

        // Create dummy project
        const project = new Project({ name: 'Test Insert' });
        await project.save();
        console.log(`Created project: ${project._id}`);

        // Create dummy data ~1.2MB
        const largeString = 'x'.repeat(1.2 * 1024 * 1024);
        const dummyData = {
            field1: largeString,
            field2: 'some other data'
        };

        console.log('Testing single insert (1.2MB)...');
        await DataRow.create({ projectId: project._id, data: dummyData });
        console.log('Single insert success.');

        console.log('Testing batch insert (5 docs, ~6MB)...');
        const batch = [];
        for (let i = 0; i < 5; i++) {
            batch.push({ projectId: project._id, data: dummyData });
        }
        await DataRow.insertMany(batch);
        console.log('Batch insert success.');

        process.exit();
    } catch (err) {
        console.error('Insert Error:', err);
        process.exit(1);
    }
};

testInsert();
