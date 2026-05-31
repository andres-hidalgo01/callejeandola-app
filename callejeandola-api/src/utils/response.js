exports.success = (res, data = {}) => {
    return res.json({
        success: true,
        data
    });
};

exports.error = (res, message = "Error") => {
    return res.status(500).json({
        success: false,
        message
    });
};