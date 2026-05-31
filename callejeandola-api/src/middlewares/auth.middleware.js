exports.requireAuth = (req, res, next) => {

    const authorized = true;

    if (!authorized) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    next();
};