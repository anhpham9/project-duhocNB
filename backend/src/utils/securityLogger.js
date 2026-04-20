import { auditLog } from "./logger.js";

/**
 * Security event logging utilities
 * Tracks security-related events for monitoring and compliance
 */
export class SecurityLogger {
    /**
     * Log failed login attempts
     */
    static logFailedLogin(username, ip, userAgent, reason = 'invalid_credentials') {
        auditLog('SECURITY_LOGIN_FAILED', null, {
            event: 'login_failed',
            username: username,
            ip: ip,
            userAgent: userAgent,
            reason: reason,
            severity: 'medium',
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Log suspicious activity
     */
    static logSuspiciousActivity(userId, ip, activity, details = {}) {
        auditLog('SECURITY_SUSPICIOUS_ACTIVITY', userId, {
            event: 'suspicious_activity',
            activity: activity,
            ip: ip,
            severity: 'high',
            details: details,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Log permission violations
     */
    static logPermissionViolation(userId, ip, resource, action, requiredPermission) {
        auditLog('SECURITY_PERMISSION_VIOLATION', userId, {
            event: 'permission_violation',
            resource: resource,
            action: action,
            requiredPermission: requiredPermission,
            ip: ip,
            severity: 'medium',
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Log account lockouts or security actions
     */
    static logSecurityAction(userId, adminUserId, action, reason, ip) {
        auditLog('SECURITY_ACTION', adminUserId, {
            event: 'security_action',
            targetUserId: userId,
            action: action,
            reason: reason,
            ip: ip,
            severity: action.includes('disable') || action.includes('lock') ? 'high' : 'medium',
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Log password-related security events
     */
    static logPasswordEvent(userId, adminUserId, event, ip) {
        auditLog('SECURITY_PASSWORD_EVENT', adminUserId, {
            event: 'password_event',
            targetUserId: userId,
            passwordEvent: event, // 'reset', 'change', 'force_reset'
            ip: ip,
            severity: event === 'force_reset' ? 'high' : 'medium',
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Log data access events for sensitive operations
     */
    static logDataAccess(userId, resource, action, recordCount = 1, filters = {}) {
        auditLog('DATA_ACCESS', userId, {
            event: 'data_access',
            resource: resource,
            action: action, // 'read', 'export', 'bulk_read'
            recordCount: recordCount,
            filters: filters,
            severity: recordCount > 100 || action === 'export' ? 'medium' : 'low',
            timestamp: new Date().toISOString()
        });
    }
}