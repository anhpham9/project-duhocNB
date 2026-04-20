import db from "../config/db.js";
import { logError, logInfo } from "../utils/logger.js";
import { SecurityLogger } from "../utils/securityLogger.js";

export const checkPermission = (permissionName) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;

            const result = await db.query(
                `
                SELECT p.name
                FROM users u
                JOIN roles r ON u.role_id = r.id
                JOIN role_permissions rp ON r.id = rp.role_id
                JOIN permissions p ON rp.permission_id = p.id
                WHERE u.id = $1 AND p.name = $2
                `,
                [userId, permissionName]
            );

            if (result.rows.length === 0) {
                // Log security violation
                SecurityLogger.logPermissionViolation(
                    userId,
                    req.ip,
                    req.originalUrl,
                    req.method,
                    permissionName
                );
                
                logError('Permission denied', new Error('Insufficient permissions'), {
                    userId: userId,
                    permission: permissionName,
                    url: req.originalUrl,
                    method: req.method,
                    ip: req.ip
                });
                
                return res.status(403).json({ 
                    success: false,
                    message: "Forbidden - Insufficient permissions" 
                });
            }

            // Log successful permission check for admin operations
            if (permissionName.includes('manage') || permissionName.includes('delete') || permissionName.includes('admin')) {
                logInfo('Permission granted for sensitive operation', {
                    userId: userId,
                    permission: permissionName,
                    url: req.originalUrl,
                    method: req.method
                });
            }

            next();
        } catch (error) {
            logError('Permission check failed', error, {
                userId: req.user?.id,
                permission: permissionName,
                url: req.originalUrl,
                method: req.method
            });
            
            return res.status(500).json({ 
                success: false,
                message: "Internal server error during permission check" 
            });
        }
    };
};