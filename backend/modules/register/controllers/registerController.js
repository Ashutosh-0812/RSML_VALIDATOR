const registerService = require('../services/registerService');

exports.registerUser = async (req, res) => {
    try {
        const userData = req.body;
        const newUser = await registerService.register(userData);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
