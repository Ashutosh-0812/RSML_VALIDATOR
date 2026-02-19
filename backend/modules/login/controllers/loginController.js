const loginService = require('../services/loginService');

exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await loginService.login(username, password);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
