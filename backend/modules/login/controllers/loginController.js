const loginService = require('../services/loginService');

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await loginService.login(email, password);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
