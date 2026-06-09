const usersService = require("../services/users.service");

exports.getUsers = async (req, res) => {
    try {
        const users = await usersService.getUsers();

        res.json({
            data: users,
        });
    } catch (error) {
        console.error("Get users error:", error);

        res.status(error.statusCode || 500).json({
            error: error.message || "Error fetching users",
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await usersService.getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        res.json({
            data: user,
        });
    } catch (error) {
        console.error("Get user by id error:", error);

        res.status(error.statusCode || 500).json({
            error: error.message || "Error fetching user",
        });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const user = await usersService.updateUserRole({
            targetUserId: req.params.id,
            newRole: req.body.role,
            currentUserId: req.user.id,
        });

        res.json({
            data: user,
        });
    } catch (error) {
        console.error("Update user role error:", error);

        res.status(error.statusCode || 500).json({
            error: error.message || "Error updating user role",
        });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const user = await usersService.updateUserStatus({
            targetUserId: req.params.id,
            active: req.body.active,
            currentUserId: req.user.id,
        });

        res.json({
            data: user,
        });
    } catch (error) {
        console.error("Update user status error:", error);

        res.status(error.statusCode || 500).json({
            error: error.message || "Error updating user status",
        });
    }
};