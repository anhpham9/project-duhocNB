import winston from 'winston';
import path from 'path';

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = 'logs';
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
);

// Create Winston logger
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { 
        service: 'duhoc-backend',
        version: '1.0.0'
    },
    transports: [
        // Error log file
        new winston.transports.File({ 
            filename: path.join(logsDir, 'error.log'), 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        }),
        
        // Combined log file
        new winston.transports.File({ 
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        }),

        // Security audit log
        new winston.transports.File({
            filename: path.join(logsDir, 'security.log'),
            level: 'warn',
            maxsize: 5242880, // 5MB
            maxFiles: 10,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
                return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
            })
        )
    }));
}

// Security audit logger
export const auditLogger = winston.createLogger({
    level: 'info',
    format: logFormat,
    defaultMeta: { 
        service: 'duhoc-security-audit',
        type: 'security_event'
    },
    transports: [
        new winston.transports.File({
            filename: path.join(logsDir, 'security-audit.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 20,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ]
});

// Helper functions
export const logInfo = (message, meta = {}) => {
    logger.info(message, meta);
};

export const logError = (message, error = null, meta = {}) => {
    const errorMeta = {
        ...meta,
        ...(error && {
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name
            }
        })
    };
    logger.error(message, errorMeta);
};

export const logWarn = (message, meta = {}) => {
    logger.warn(message, meta);
};

export const logDebug = (message, meta = {}) => {
    logger.debug(message, meta);
};

// Security audit logging
export const auditLog = (action, userId, details = {}, req = null) => {
    const auditData = {
        action,
        userId,
        timestamp: new Date().toISOString(),
        ip: req?.ip || req?.connection?.remoteAddress || 'unknown',
        userAgent: req?.get('User-Agent') || 'unknown',
        sessionId: req?.sessionID || 'unknown',
        details,
        severity: getSeverityLevel(action)
    };

    auditLogger.info('Security audit event', auditData);
    
    // Also log to main logger if high severity
    if (auditData.severity === 'high' || auditData.severity === 'critical') {
        logger.warn('High severity security event', auditData);
    }
};

// Determine severity level based on action
const getSeverityLevel = (action) => {
    const severityMap = {
        // Critical actions
        'DELETE_USER': 'critical',
        'RESET_PASSWORD': 'critical',
        'LOGIN_FAILURE_RATE_LIMIT': 'critical',
        'UNAUTHORIZED_ACCESS_ATTEMPT': 'critical',
        
        // High severity actions  
        'CREATE_USER': 'high',
        'UPDATE_USER': 'high',
        'LOGIN_SUCCESS': 'high',
        'LOGIN_FAILURE': 'high',
        'LOGOUT': 'high',
        
        // Medium severity actions
        'VIEW_USER': 'medium',
        'VIEW_USERS': 'medium',
        'GET_ROLES': 'medium',
        
        // Low severity actions
        'API_REQUEST': 'low'
    };
    
    return severityMap[action] || 'medium';
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log request
    logger.info('Incoming request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id || 'anonymous'
    });

    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'error' : 'info';
        
        logger.log(logLevel, 'Request completed', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userId: req.user?.id || 'anonymous'
        });
    });

    next();
};

export default {
    logger,
    auditLogger,
    logInfo,
    logError,
    logWarn,
    logDebug,
    auditLog,
    requestLogger
};