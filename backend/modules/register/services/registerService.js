const User = require('../../../database/models/User');
const bcrypt = require('bcryptjs');

exports.register = async (userData) => {
    const { name, email, password, role } = userData;

    // Check if user exists by email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role || 'reviewer'
    });

    await user.save();

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    };
};
