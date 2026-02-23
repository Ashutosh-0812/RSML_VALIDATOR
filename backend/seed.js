const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./database/models/User');
const connectDB = require('./database/connection');

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        // Check and create Admin
        const adminExists = await User.findOne({ username: 'admin' });
        if (adminExists) {
            console.log('Admin user already exists');
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            const adminUser = new User({
                username: 'admin',
                password: hashedPassword,
                role: 'admin'
            });
            await adminUser.save();
            console.log('Admin user created successfully');
            console.log('Username: admin');
            console.log('Password: password123');
        } //

        // Check and create Reviewer
        const reviewerExists = await User.findOne({ username: 'Reviewer' });
        if (reviewerExists) {
            console.log('Reviewer user already exists');
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            const reviewerUser = new User({
                username: 'Reviewer',
                password: hashedPassword,
                role: 'reviewer' // Fixed role to match enum in User model
            });
            await reviewerUser.save();
            console.log('Reviewer user created successfully');
            console.log('Username: Reviewer');
            console.log('Password: password123');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
