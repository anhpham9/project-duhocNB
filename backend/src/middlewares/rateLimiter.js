import rateLimit from 'express-rate-limit';
import { logInfo, logWarn } from '../utils/logger.js';

// Rate limiter for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Limit each IP to 15 requests per windowMs for auth endpoints
    message: {
        success: false,
        message: "Too many authentication attempts, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logWarn('Rate limit exceeded for auth endpoint', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.originalUrl
        });
        res.status(options.statusCode).json(options.message);
    },
    skip: (req, res) => {
        // Skip rate limiting for successful responses
        return res.statusCode < 400;
    }
});

// Rate limiter for users endpoints
const usersLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs for users endpoints
    message: {
        success: false,
        message: "Too many requests to users API, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logWarn('Rate limit exceeded for users endpoint', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.originalUrl,
            userId: req.user?.id
        });
        res.status(options.statusCode).json(options.message);
    }
});

// Rate limiter for contacts endpoints
const contactsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs for contacts endpoints
    message: {
        success: false,
        message: "Too many requests to contacts API, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logWarn('Rate limit exceeded for contacts endpoint', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.originalUrl,
            userId: req.user?.id
        });
        res.status(options.statusCode).json(options.message);
    }
});

// Rate limiter for news endpoints
const newsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Higher limit for news as it's content-heavy
    message: {
        success: false,
        message: "Too many requests to news API, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logWarn('Rate limit exceeded for news endpoint', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.originalUrl,
            userId: req.user?.id
        });
        res.status(options.statusCode).json(options.message);
    },
    skip: (req, res) => {
        // Skip rate limiting for news view tracking (public endpoint)
        return req.originalUrl.includes('/view') && req.method === 'POST';
    }
});

// Rate limiter for categories endpoints
const categoriesLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Lower limit for categories as they're less frequently accessed
    message: {
        success: false,
        message: "Too many requests to categories API, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logWarn('Rate limit exceeded for categories endpoint', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.originalUrl,
            userId: req.user?.id
        });
        res.status(options.statusCode).json(options.message);
    }
});

// Rate limiter for public news view tracking
const publicViewLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // Allow 30 views per minute per IP
    message: {
        success: false,
        message: "Too many view requests, please slow down."
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logWarn('Rate limit exceeded for public view tracking', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.originalUrl
        });
        res.status(options.statusCode).json(options.message);
    }
});

// Global rate limiter for all API endpoints
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
        success: false,
        message: "Too many requests from this IP, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logWarn('Global rate limit exceeded', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.originalUrl,
            userId: req.user?.id
        });
        res.status(options.statusCode).json(options.message);
    }
});

// Strict rate limiter for sensitive operations
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Only 5 requests per hour
    message: {
        success: false,
        message: "Too many sensitive operations, please wait before trying again."
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logWarn('Strict rate limit exceeded', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.originalUrl,
            userId: req.user?.id
        });
        res.status(options.statusCode).json(options.message);
    }
});

// Custom rate limiter for file uploads
const uploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // 10 uploads per 10 minutes
    message: {
        success: false,
        message: "Too many file uploads, please wait before uploading again."
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logWarn('Upload rate limit exceeded', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.originalUrl,
            userId: req.user?.id
        });
        res.status(options.statusCode).json(options.message);
    }
});

export const rateLimiter = {
    auth: authLimiter,
    users: usersLimiter,
    contacts: contactsLimiter,
    news: newsLimiter,
    categories: categoriesLimiter,
    global: globalLimiter,
    strict: strictLimiter,
    upload: uploadLimiter,
    publicView: publicViewLimiter,
    
    // Convenience methods
    authLimiter,
    usersLimiter,
    contactsLimiter,
    newsLimiter,
    categoriesLimiter,
    globalLimiter,
    strictLimiter,
    uploadLimiter,
    publicViewLimiter
};