const User = require('../../../database/models/User');
const bcrypt = require('bcryptjs');

exports.register = async (userData) => {
    const { username, password, role } = userData;

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
        username,
        password: hashedPassword,
        role: role || 'reviewer' // Default role
    });

    await user.save();

    return {
        _id: user._id,
        username: user.username,
        role: user.role
    };
};
