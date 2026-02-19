const User = require('../../../database/models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (username, password) => {
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
        throw new Error('Invalid credentials');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    // Generate token
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    return {
        token,
        user: {
            _id: user._id,
            username: user.username,
            role: user.role
        }
    };
};
