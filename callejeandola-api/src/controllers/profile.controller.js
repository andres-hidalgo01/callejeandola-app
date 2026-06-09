const profileService = require("../services/profile.service");

exports.getMyProfile = async (req, res) => {
    try {
        const profile = await profileService.getProfileByUserId(req.user.id);

        res.json({
            data: profile,
        });
    } catch (error) {
        console.error("Get profile error:", error);

        res.status(error.statusCode || 500).json({
            error: error.message || "Error fetching profile",
        });
    }
};

exports.updateMyProfile = async (req, res) => {
    try {
        const profile = await profileService.upsertProfile(req.user.id, req.body);

        res.json({
            data: profile,
        });
    } catch (error) {
        console.error("Update profile error:", error);

        res.status(error.statusCode || 500).json({
            error: error.message || "Error updating profile",
        });
    }
};