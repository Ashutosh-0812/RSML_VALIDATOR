const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./database/connection');
const Project = require('./database/models/Project');
const User = require('./database/models/User');
const DataRow = require('./database/models/DataRow');

dotenv.config();

const cleanData = async () => {
    try {
        await connectDB();

        console.log('Cleaning database...');

        const projectsDeleted = await Project.deleteMany({});
        console.log(`Deleted ${projectsDeleted.deletedCount} projects.`);

        const usersDeleted = await User.deleteMany({});
        console.log(`Deleted ${usersDeleted.deletedCount} users.`);

        const dataRowsDeleted = await DataRow.deleteMany({});
        console.log(`Deleted ${dataRowsDeleted.deletedCount} data rows.`);

        console.log('Database cleaned successfully.');
        process.exit();
    } catch (err) {
        console.error('Error cleaning database:', err);
        process.exit(1);
    }
};

cleanData();
