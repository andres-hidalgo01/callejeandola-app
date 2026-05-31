exports.requireRole = (roles = []) => {

    return (req, res, next) => {

        const userRole = "GLOBAL_ADMIN";

        if (!roles.includes(userRole)) {

            return res.status(403).json({
                error: "Forbidden"
            });
        }
        next();
    };
};