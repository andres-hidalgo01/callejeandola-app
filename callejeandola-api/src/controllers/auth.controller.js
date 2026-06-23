const authService = require("../services/auth.service");

const {
    register,
    login,
    me,
    verifyEmail,
    resendVerificationCode,
} = require("../services/auth.service");

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

exports.verifyEmailController = async (req, res) => {
    try {
        const result = await authService.verifyEmail(req.body);

        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            error: error.message || "Error verifying email",
        });
    }
};

exports.resendVerificationCodeController = async (req, res) => {
    try {
        const result = await authService.resendVerificationCode(req.body);

        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            error: error.message || "Error resending verification code",
        });
    }
};