const authService = require("../services/auth.service");

exports.register = async (req, res) => {
    try {
        const result = await authService.registerUser(req.body);

        res.status(201).json(result);
    } catch (error) {
        console.error("Register error:", error);

        res.status(error.statusCode || 500).json({
            error: error.message || "Error registering user",
        });
    }
};

exports.login = async (req, res) => {
    try {
        const result = await authService.loginUser(req.body);

        res.json(result);
    } catch (error) {
        console.error("Login error:", error);

        res.status(error.statusCode || 500).json({
            error: error.message || "Error logging in",
        });
    }
};

exports.me = async (req, res) => {
    try {
        const user = await authService.getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        res.json({
            user,
        });
    } catch (error) {
        console.error("Auth me error:", error);

        res.status(500).json({
            error: "Error fetching authenticated user",
        });
    }
};