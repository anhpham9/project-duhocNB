// security.config.js - Security Configuration for Production
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import winston from 'winston';

// Environment validation
const validateEnv = () => {
    const required = ['JWT_SECRET', 'DATABASE_URL', 'NODE_ENV'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long');
    }
};

// Security Configuration
export const SECURITY_CONFIG = {
    JWT: {
        SECRET: process.env.JWT_SECRET,
        EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
        ALGORITHM: 'HS256'
    },
    
    BCRYPT: {
        ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12
    },
    
    API: {
        BASE_URL: process.env.API_BASE_URL || 'http://localhost:5000/api',
        FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
    },
    
    RATE_LIMITS: {
        // General API rate limiting
        GENERAL: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.'
        },
        
        // Auth endpoints (stricter)
        AUTH: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5, // limit each IP to 5 requests per windowMs
            message: 'Too many authentication attempts, please try again later.',
            skipSuccessfulRequests: true
        },
        
        // User management endpoints
        USER_MANAGEMENT: {
            windowMs: 60 * 1000, // 1 minute
            max: 10, // limit each IP to 10 requests per minute
            message: 'Too many user management requests, please slow down.'
        }
    }
};

// Rate Limiters
export const rateLimiters = {
    general: rateLimit(SECURITY_CONFIG.RATE_LIMITS.GENERAL),
    auth: rateLimit(SECURITY_CONFIG.RATE_LIMITS.AUTH),
    userManagement: rateLimit(SECURITY_CONFIG.RATE_LIMITS.USER_MANAGEMENT)
};

// Helmet Security Headers
export const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false // Adjust based on your needs
});

// CORS Configuration
export const corsConfig = cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            SECURITY_CONFIG.API.FRONTEND_URL,
            'http://localhost:3000',
            'https://yourdomain.com'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
});

// Logger Configuration
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'duhoc-api' },
    transports: [
        // Write all logs error (and below) to error.log
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        
        // Write all logs info (and below) to combined.log
        new winston.transports.File({ 
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Security Middleware Setup Function
export const setupSecurity = (app) => {
    // Validate environment first
    validateEnv();
    
    // Security headers
    app.use(helmetConfig);
    
    // CORS
    app.use(corsConfig);
    
    // General rate limiting
    app.use('/api/', rateLimiters.general);
    
    // Specific rate limiting for auth endpoints
    app.use('/api/auth/', rateLimiters.auth);
    
    // Specific rate limiting for user management
    app.use('/api/users/', rateLimiters.userManagement);
    
    logger.info('Security middleware configured successfully');
};

// Input Sanitization Utilities
export const sanitize = {
    email: (email) => {
        if (typeof email !== 'string') return '';
        return email.toLowerCase().trim();
    },
    
    name: (name) => {
        if (typeof name !== 'string') return '';
        // Remove HTML tags and trim
        return name.replace(/<[^>]*>?/gm, '').trim();
    },
    
    phone: (phone) => {
        if (typeof phone !== 'string') return '';
        // Keep only numbers and basic phone characters
        return phone.replace(/[^0-9+\-\s()]/g, '').trim();
    },
    
    username: (username) => {
        if (typeof username !== 'string') return '';
        // Allow only alphanumeric, underscore, and dash
        return username.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
    }
};

// Audit Log Helper
export const auditLog = (action, userId, targetUserId = null, details = {}) => {
    logger.info('User Action', {
        action,
        userId,
        targetUserId,
        details,
        timestamp: new Date().toISOString(),
        ip: details.ip || 'unknown'
    });
};

export default {
    SECURITY_CONFIG,
    rateLimiters,
    helmetConfig,
    corsConfig,
    logger,
    setupSecurity,
    sanitize,
    auditLog,
    validateEnv
};