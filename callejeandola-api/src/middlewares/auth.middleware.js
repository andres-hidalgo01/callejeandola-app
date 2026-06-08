// const { verifyToken } = require("../utils/jwt");

// function authMiddleware(req, res, next) {
//     try {
//         const authHeader = req.headers.authorization;

//         if (!authHeader) {
//             return res.status(401).json({
//                 error: "Authorization header is required",
//             });
//         }

//         const [scheme, token] = authHeader.split(" ");

//         if (scheme !== "Bearer" || !token) {
//             return res.status(401).json({
//                 error: "Invalid authorization format",
//             });
//         }

//         const decoded = verifyToken(token);

//         req.user = decoded;

//         next();
//     } catch (error) {
//         console.error("Auth middleware error:", error);

//         return res.status(401).json({
//             error: "Invalid or expired token",
//         });
//     }
// }

// function requireRole(allowedRoles = []) {
//     return (req, res, next) => {
//         if (!req.user) {
//             return res.status(401).json({
//                 error: "Authentication required",
//             });
//         }

//         if (!allowedRoles.includes(req.user.role)) {
//             return res.status(403).json({
//                 error: "Forbidden",
//             });
//         }

//         next();
//     };
// }

// module.exports = {
//     authMiddleware,
//     requireRole,
// };

const { verifyToken } = require("../utils/jwt");

function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: "Authorization header is required",
            });
        }

        const [scheme, token] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({
                error: "Invalid authorization format",
            });
        }

        const decoded = verifyToken(token);

        req.user = decoded;

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);

        return res.status(401).json({
            error: "Invalid or expired token",
        });
    }
}

function requireRole(allowedRoles = []) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: "Authentication required",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: "Forbidden",
            });
        }

        next();
    };
}

module.exports = {
    authMiddleware,
    requireRole,
};
