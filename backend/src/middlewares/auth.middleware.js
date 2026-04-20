import { verifyToken } from "../utils/jwt.js";
import { logError } from "../utils/logger.js";

export const authenticate = (req, res, next) => {
    try {
        // Check cookie first, then Authorization header (for API testing)
        const token = req.cookies.authToken || 
                      (req.headers.authorization && req.headers.authorization.startsWith("Bearer ") 
                        ? req.headers.authorization.split(" ")[1] 
                        : null);

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Access token is required" 
            });
        }

        const user = verifyToken(token);

        req.user = user;

        next();
    } catch (err) {
        logError('Authentication failed', err, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.originalUrl,
            method: req.method,
            hasToken: !!req.cookies.authToken || !!req.headers.authorization
        });
        return res.status(401).json({ 
            success: false,
            message: "Invalid or expired token" 
        });
    }
};