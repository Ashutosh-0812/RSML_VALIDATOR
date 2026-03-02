const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./database/models/User');
const connectDB = require('./database/connection');

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        // Clear all existing users
        await User.deleteMany({});
        console.log('All existing users cleared.');

        // Seed Admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        const adminUser = new User({
            name: 'Admin',
            email: 'admin@rsml.com',
            password: hashedPassword,
            role: 'admin'
        });
        await adminUser.save();

        console.log('\nAdmin user created successfully!');
        console.log('-----------------------------');
        console.log('Name    : Admin');
        console.log('Email   : admin@rsml.com');
        console.log('Password: password123');
        console.log('Role    : admin');
        console.log('-----------------------------');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
