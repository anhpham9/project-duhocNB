import validator from 'validator';
import xss from 'xss';
import { logger } from './logger.js';

// XSS filter configuration
const xssOptions = {
    whiteList: {
        // Allow very minimal HTML tags if needed
        p: [],
        br: [],
        strong: [],
        em: [],
        u: []
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
    allowCommentTag: false
};

// Input sanitization utilities
export class InputSanitizer {
    
    // Sanitize general text input
    static sanitizeText(input, options = {}) {
        if (typeof input !== 'string') {
            logger.warn('Non-string input provided to sanitizeText', { 
                input: typeof input,
                value: input 
            });
            return '';
        }

        let sanitized = input;
        
        // Trim whitespace
        sanitized = sanitized.trim();
        
        // Remove XSS attempts
        sanitized = xss(sanitized, xssOptions);
        
        // Escape HTML entities if specified
        if (options.escapeHtml !== false) {
            sanitized = validator.escape(sanitized);
        }
        
        // Remove null bytes and control characters
        sanitized = sanitized.replace(/\0/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        
        // Limit length if specified
        if (options.maxLength) {
            sanitized = sanitized.substring(0, options.maxLength);
        }

        return sanitized;
    }

    // Sanitize email input
    static sanitizeEmail(email) {
        if (typeof email !== 'string') {
            logger.warn('Non-string email provided', { email });
            return '';
        }

        let sanitized = email.toLowerCase().trim();
        
        // Remove potentially dangerous characters
        sanitized = sanitized.replace(/[^\w@.-]/g, '');
        
        // Validate email format
        if (!validator.isEmail(sanitized)) {
            logger.warn('Invalid email format detected', { 
                original: email,
                sanitized 
            });
            return '';
        }

        // Normalize email
        try {
            sanitized = validator.normalizeEmail(sanitized, {
                gmail_remove_dots: false,
                gmail_remove_subaddress: false,
                outlookdotcom_remove_subaddress: false,
                yahoo_remove_subaddress: false,
                icloud_remove_subaddress: false
            });
        } catch (error) {
            logger.error('Email normalization failed', error, { email });
            return '';
        }

        return sanitized || '';
    }

    // Sanitize username input  
    static sanitizeUsername(username) {
        if (typeof username !== 'string') {
            logger.warn('Non-string username provided', { username });
            return '';
        }

        let sanitized = username.trim().toLowerCase();
        
        // Allow only alphanumeric, underscore, dash, and dot
        sanitized = sanitized.replace(/[^a-z0-9_.-]/g, '');
        
        // Remove multiple consecutive special characters
        sanitized = sanitized.replace(/[_.-]{2,}/g, '_');
        
        // Remove leading/trailing special characters
        sanitized = sanitized.replace(/^[_.-]+|[_.-]+$/g, '');
        
        // Length validation
        if (sanitized.length < 3 || sanitized.length > 30) {
            logger.warn('Username length out of bounds', { 
                original: username,
                sanitized,
                length: sanitized.length 
            });
        }

        return sanitized;
    }

    // Sanitize phone number
    static sanitizePhone(phone) {
        if (typeof phone !== 'string') {
            logger.warn('Non-string phone provided', { phone });
            return '';
        }

        let sanitized = phone.trim();
        
        // Keep only numbers, +, -, (, ), and spaces
        sanitized = sanitized.replace(/[^0-9+\-() ]/g, '');
        
        // Remove excessive spaces
        sanitized = sanitized.replace(/\s+/g, ' ').trim();
        
        // Basic phone validation
        const phoneRegex = /^[\+]?[0-9\-\(\)\ ]{8,20}$/;
        if (!phoneRegex.test(sanitized)) {
            logger.warn('Invalid phone format detected', { 
                original: phone,
                sanitized 
            });
        }

        return sanitized;
    }

    // Sanitize name input
    static sanitizeName(name) {
        if (typeof name !== 'string') {
            logger.warn('Non-string name provided', { name });
            return '';
        }

        let sanitized = name.trim();
        
        // Remove XSS attempts
        sanitized = xss(sanitized, xssOptions);
        
        // Allow letters, spaces, apostrophes, hyphens, and dots
        sanitized = sanitized.replace(/[^a-zA-ZÀ-ỹ\s'.-]/g, '');
        
        // Remove multiple consecutive spaces
        sanitized = sanitized.replace(/\s+/g, ' ').trim();
        
        // Capitalize properly
        sanitized = sanitized.replace(/\b\w/g, l => l.toUpperCase());
        
        // Length validation
        if (sanitized.length > 100) {
            sanitized = sanitized.substring(0, 100);
            logger.warn('Name truncated due to length', { 
                original: name,
                truncated: sanitized 
            });
        }

        return sanitized;
    }

    // Sanitize numeric input
    static sanitizeNumber(input, options = {}) {
        let number = parseInt(input, 10);
        
        if (isNaN(number)) {
            logger.warn('Invalid number input', { input });
            return options.default || 0;
        }

        // Apply min/max constraints
        if (options.min !== undefined && number < options.min) {
            logger.warn('Number below minimum', { 
                input,
                number,
                min: options.min 
            });
            number = options.min;
        }

        if (options.max !== undefined && number > options.max) {
            logger.warn('Number above maximum', { 
                input,
                number,
                max: options.max 
            });
            number = options.max;
        }

        return number;
    }

    // Sanitize boolean input
    static sanitizeBoolean(input, defaultValue = false) {
        if (typeof input === 'boolean') {
            return input;
        }

        if (typeof input === 'string') {
            const lower = input.toLowerCase().trim();
            if (lower === 'true' || lower === '1' || lower === 'yes') {
                return true;
            }
            if (lower === 'false' || lower === '0' || lower === 'no') {
                return false;
            }
        }

        if (typeof input === 'number') {
            return input !== 0;
        }

        logger.warn('Invalid boolean input, using default', { 
            input,
            defaultValue 
        });
        return defaultValue;
    }

    // Comprehensive user data sanitization
    static sanitizeUserData(userData) {
        const sanitized = {};

        // Sanitize each field
        if (userData.name) {
            sanitized.name = this.sanitizeName(userData.name);
        }

        if (userData.username) {
            sanitized.username = this.sanitizeUsername(userData.username);
        }

        if (userData.email) {
            sanitized.email = this.sanitizeEmail(userData.email);
        }

        if (userData.phone) {
            sanitized.phone = this.sanitizePhone(userData.phone);
        }

        if (userData.role_id) {
            sanitized.role_id = this.sanitizeNumber(userData.role_id, {
                min: 1,
                max: 5,
                default: 5
            });
        }

        if (userData.is_active !== undefined) {
            sanitized.is_active = this.sanitizeBoolean(userData.is_active, true);
        }

        // Don't sanitize password - let it be validated separately
        if (userData.password) {
            sanitized.password = userData.password;
        }

        logger.debug('User data sanitized', {
            originalFields: Object.keys(userData),
            sanitizedFields: Object.keys(sanitized)
        });

        return sanitized;
    }

    // Comprehensive contact data sanitization
    static sanitizeContactData(contactData) {
        const sanitized = {};

        // Sanitize each field
        if (contactData.name) {
            sanitized.name = this.sanitizeName(contactData.name);
        }

        if (contactData.email) {
            sanitized.email = this.sanitizeEmail(contactData.email);
        }

        if (contactData.phone) {
            sanitized.phone = this.sanitizePhone(contactData.phone);
        }

        if (contactData.message) {
            sanitized.message = this.sanitizeText(contactData.message, {
                maxLength: 5000, // Allow longer messages
                escapeHtml: false // Keep basic HTML for messages
            });
        }

        if (contactData.status) {
            sanitized.status = this.sanitizeText(contactData.status, {
                maxLength: 30
            });
        }

        if (contactData.contact_method) {
            sanitized.contact_method = this.sanitizeText(contactData.contact_method, {
                maxLength: 20
            });
        }

        if (contactData.social_contact) {
            sanitized.social_contact = this.sanitizeText(contactData.social_contact, {
                maxLength: 255
            });
        }

        if (contactData.assigned_to) {
            sanitized.assigned_to = this.sanitizeNumber(contactData.assigned_to, {
                min: 1,
                max: 999999,
                default: null
            });
        }

        if (contactData.first_contacted_at) {
            sanitized.first_contacted_at = contactData.first_contacted_at; // Let DB handle timestamp validation
        }

        if (contactData.closed_at) {
            sanitized.closed_at = contactData.closed_at; // Let DB handle timestamp validation
        }

        if (contactData.note) {
            sanitized.note = this.sanitizeText(contactData.note, {
                maxLength: 2000, // Allow longer notes
                escapeHtml: false // Keep basic HTML for notes
            });
        }

        logger.debug('Contact data sanitized', {
            originalFields: Object.keys(contactData),
            sanitizedFields: Object.keys(sanitized)
        });

        return sanitized;
    }

    // Comprehensive news data sanitization
    static sanitizeNewsData(newsData) {
        const sanitized = {};

        // Sanitize each field
        if (newsData.title) {
            sanitized.title = this.sanitizeText(newsData.title, {
                maxLength: 255,
                escapeHtml: false
            });
        }

        if (newsData.slug) {
            sanitized.slug = this.sanitizeSlug(newsData.slug);
        }

        if (newsData.content) {
            sanitized.content = this.sanitizeText(newsData.content, {
                maxLength: 50000, // Allow very long content
                escapeHtml: false // Keep basic HTML for content
            });
        }

        if (newsData.excerpt) {
            sanitized.excerpt = this.sanitizeText(newsData.excerpt, {
                maxLength: 500,
                escapeHtml: false
            });
        }

        if (newsData.thumbnail_url) {
            sanitized.thumbnail_url = this.sanitizeUrl(newsData.thumbnail_url);
        }

        if (newsData.category_id) {
            sanitized.category_id = this.sanitizeNumber(newsData.category_id, {
                min: 1,
                max: 999999,
                default: null
            });
        }

        if (newsData.status) {
            const validStatuses = ['draft', 'published', 'archived'];
            const status = this.sanitizeText(newsData.status, { maxLength: 20 });
            sanitized.status = validStatuses.includes(status) ? status : 'draft';
        }

        if (newsData.meta_title) {
            sanitized.meta_title = this.sanitizeText(newsData.meta_title, {
                maxLength: 255,
                escapeHtml: false
            });
        }

        if (newsData.meta_description) {
            sanitized.meta_description = this.sanitizeText(newsData.meta_description, {
                maxLength: 500,
                escapeHtml: false
            });
        }

        logger.debug('News data sanitized', {
            originalFields: Object.keys(newsData),
            sanitizedFields: Object.keys(sanitized)
        });

        return sanitized;
    }

    // Comprehensive category data sanitization
    static sanitizeCategoryData(categoryData) {
        const sanitized = {};

        // Sanitize each field
        if (categoryData.name) {
            sanitized.name = this.sanitizeText(categoryData.name, {
                maxLength: 100,
                escapeHtml: false
            });
        }

        if (categoryData.slug) {
            sanitized.slug = this.sanitizeSlug(categoryData.slug);
        }

        logger.debug('Category data sanitized', {
            originalFields: Object.keys(categoryData),
            sanitizedFields: Object.keys(sanitized)
        });

        return sanitized;
    }

    // Sanitize URL input
    static sanitizeUrl(url) {
        if (typeof url !== 'string') {
            logger.warn('Non-string URL provided', { url });
            return '';
        }

        let sanitized = url.trim();
        
        // Remove XSS attempts
        sanitized = xss(sanitized, {
            whiteList: {},
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script', 'style']
        });
        
        // Validate URL format
        try {
            if (validator.isURL(sanitized, {
                protocols: ['http', 'https'],
                require_protocol: true,
                require_host: true,
                require_valid_protocol: true,
                allow_underscores: true
            })) {
                return sanitized;
            }
        } catch (error) {
            logger.error('URL validation failed', error, { url });
        }

        logger.warn('Invalid URL format detected', { 
            original: url,
            sanitized 
        });
        return '';
    }

    // Sanitize slug input
    static sanitizeSlug(slug) {
        if (typeof slug !== 'string') {
            logger.warn('Non-string slug provided', { slug });
            return '';
        }

        let sanitized = slug.trim().toLowerCase();
        
        // Allow only alphanumeric, dash, and underscore
        sanitized = sanitized.replace(/[^a-z0-9_-]/g, '-');
        
        // Remove multiple consecutive dashes
        sanitized = sanitized.replace(/-{2,}/g, '-');
        
        // Remove leading/trailing dashes
        sanitized = sanitized.replace(/^-+|-+$/g, '');
        
        // Length validation
        if (sanitized.length > 150) {
            sanitized = sanitized.substring(0, 150);
            logger.warn('Slug truncated due to length', { 
                original: slug,
                truncated: sanitized 
            });
        }

        return sanitized;
    }

    // SQL injection prevention helper
    static preventSQLInjection(input) {
        if (typeof input !== 'string') return input;
        
        // Common SQL injection patterns
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
            /(UNION\s+SELECT)/gi,
            /(OR\s+1\s*=\s*1)/gi,
            /(AND\s+1\s*=\s*1)/gi,
            /('|\"|;|--|\/\*|\*\/)/g
        ];

        for (const pattern of sqlPatterns) {
            if (pattern.test(input)) {
                logger.error('Potential SQL injection attempt detected', {
                    input,
                    pattern: pattern.toString(),
                    blocked: true
                });
                
                // Return empty string or throw error
                throw new Error('Invalid input detected');
            }
        }

        return input;
    }
}

// Middleware for automatic input sanitization
export const sanitizeInputs = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        const originalBody = { ...req.body };
        
        // Sanitize common fields automatically
        if (req.body.name) {
            req.body.name = InputSanitizer.sanitizeName(req.body.name);
        }
        
        if (req.body.username) {
            req.body.username = InputSanitizer.sanitizeUsername(req.body.username);
        }
        
        if (req.body.email) {
            req.body.email = InputSanitizer.sanitizeEmail(req.body.email);
        }
        
        if (req.body.phone) {
            req.body.phone = InputSanitizer.sanitizePhone(req.body.phone);
        }

        logger.debug('Request inputs sanitized', {
            endpoint: req.originalUrl,
            method: req.method,
            fieldsProcessed: Object.keys(req.body),
            userId: req.user?.id
        });
    }

    next();
};

export default InputSanitizer;