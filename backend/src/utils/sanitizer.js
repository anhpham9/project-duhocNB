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
        const useFloat = options.allowFloat === true;
        let number = useFloat ? parseFloat(input) : parseInt(input, 10);
        
        if (Number.isNaN(number)) {
            logger.warn('Invalid number input', { input });
            return options.default ?? 0;
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

        if (useFloat && Number.isInteger(options.decimals) && options.decimals >= 0) {
            number = Number(number.toFixed(options.decimals));
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

        if (newsData.published_at !== undefined) {
            if (newsData.published_at === null || newsData.published_at === '') {
                sanitized.published_at = null;
            } else {
                const publishedAtRaw = String(newsData.published_at).trim();
                const localDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

                // Keep datetime-local input as local DB timestamp to avoid timezone shifting.
                if (localDateTimePattern.test(publishedAtRaw)) {
                    sanitized.published_at = publishedAtRaw.length === 16
                        ? `${publishedAtRaw.replace('T', ' ')}:00`
                        : publishedAtRaw.replace('T', ' ');
                } else {
                    const publishedAt = new Date(publishedAtRaw);
                    if (!isNaN(publishedAt.getTime())) {
                        sanitized.published_at = publishedAt.toISOString().slice(0, 19).replace('T', ' ');
                    } else {
                        logger.warn('Invalid published_at format detected', {
                            original: newsData.published_at
                        });
                    }
                }
            }
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

        if (Object.prototype.hasOwnProperty.call(newsData, 'is_featured')) {
            if (typeof newsData.is_featured === 'boolean') {
                sanitized.is_featured = newsData.is_featured;
            } else if (typeof newsData.is_featured === 'string') {
                const normalized = newsData.is_featured.trim().toLowerCase();
                if (normalized === 'true' || normalized === '1') sanitized.is_featured = true;
                if (normalized === 'false' || normalized === '0') sanitized.is_featured = false;
            }
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

    // Comprehensive schools data sanitization
    static sanitizeSchoolData(schoolData) {
        const sanitized = {};
        const allowedIntakeMonths = new Set([1, 4, 7, 10]);

        // Sanitize each field
        if (schoolData.name) {
            sanitized.name = this.sanitizeText(schoolData.name, {
                maxLength: 200,
                escapeHtml: false
            });
        }

        if (schoolData.name_en) {
            sanitized.name_en = this.sanitizeText(schoolData.name_en, {
                maxLength: 200,
                escapeHtml: false
            });
        }

        if (schoolData.slug) {
            sanitized.slug = this.sanitizeSlug(schoolData.slug);
        }

        if (schoolData.location) {
            sanitized.location = this.sanitizeText(schoolData.location, {
                maxLength: 500,
                escapeHtml: false
            });
        }

        if (schoolData.phone) {
            sanitized.phone = this.sanitizePhone(schoolData.phone);
        }

        if (schoolData.fax) {
            sanitized.fax = this.sanitizePhone(schoolData.fax);
        }

        if (schoolData.email) {
            sanitized.email = this.sanitizeEmail(schoolData.email);
        }

        if (schoolData.website) {
            sanitized.website = this.sanitizeUrl(schoolData.website);
        }

        if (schoolData.tuition_per_year) {
            sanitized.tuition_per_year = this.sanitizeNumber(schoolData.tuition_per_year, {
                min: 0,
                max: 10000000,
                default: null
            });
        }

        if (schoolData.class_size) {
            sanitized.class_size = this.sanitizeNumber(schoolData.class_size, {
                min: 1,
                max: 200,
                default: null
            });
        }

        if (schoolData.visa_success_rate) {
            sanitized.visa_success_rate = this.sanitizeNumber(schoolData.visa_success_rate, {
                min: 0,
                max: 100,
                default: null
            });
        }

        if (schoolData.features) {
            // Handle JSONB features field
            if (typeof schoolData.features === 'object') {
                sanitized.features = this.sanitizeJSONData(schoolData.features);
            }
        }

        if (schoolData.intake_months !== undefined) {
            const source = Array.isArray(schoolData.intake_months)
                ? schoolData.intake_months
                : [];

            const normalized = [];
            const seen = new Set();

            for (const month of source) {
                const value = this.sanitizeNumber(month, {
                    min: 1,
                    max: 12,
                    default: null
                });

                if (!Number.isInteger(value) || !allowedIntakeMonths.has(value)) {
                    continue;
                }

                if (!seen.has(value)) {
                    seen.add(value);
                    normalized.push(value);
                }
            }

            normalized.sort((a, b) => a - b);
            sanitized.intake_months = normalized;
        }

        if (schoolData.region_id) {
            sanitized.region_id = this.sanitizeNumber(schoolData.region_id, {
                min: 1,
                max: 999999,
                default: null
            });
        }

        if (schoolData.type_id) {
            sanitized.type_id = this.sanitizeNumber(schoolData.type_id, {
                min: 1,
                max: 999999,
                default: null
            });
        }

        if (schoolData.status) {
            const validStatuses = ['partner', 'active', 'paused', 'pending'];
            const status = this.sanitizeText(schoolData.status, { maxLength: 20 });
            sanitized.status = validStatuses.includes(status) ? status : 'pending';
        }

        if (schoolData.logo_url) {
            sanitized.logo_url = this.sanitizeUrl(schoolData.logo_url);
        }

        if (schoolData.thumbnail_url) {
            sanitized.thumbnail_url = this.sanitizeUrl(schoolData.thumbnail_url);
        }

        if (schoolData.rating !== undefined && schoolData.rating !== null && schoolData.rating !== '') {
            sanitized.rating = this.sanitizeNumber(schoolData.rating, {
                allowFloat: true,
                decimals: 1,
                min: 0,
                max: 5,
                default: null
            });
        }

        if (schoolData.review_count !== undefined && schoolData.review_count !== null && schoolData.review_count !== '') {
            sanitized.review_count = this.sanitizeNumber(schoolData.review_count, {
                min: 0,
                max: 1000000,
                default: 0
            });
        }

        logger.debug('School data sanitized', {
            originalFields: Object.keys(schoolData),
            sanitizedFields: Object.keys(sanitized)
        });

        return sanitized;
    }

    // Comprehensive regions data sanitization
    static sanitizeRegionData(regionData) {
        const sanitized = {};

        // Sanitize each field
        if (regionData.name) {
            sanitized.name = this.sanitizeText(regionData.name, {
                maxLength: 100,
                escapeHtml: false
            });
        }

        if (regionData.slug) {
            sanitized.slug = this.sanitizeSlug(regionData.slug);
        }

        logger.debug('Region data sanitized', {
            originalFields: Object.keys(regionData),
            sanitizedFields: Object.keys(sanitized)
        });

        return sanitized;
    }

    // Comprehensive school types data sanitization
    static sanitizeSchoolTypeData(schoolTypeData) {
        const sanitized = {};

        // Sanitize each field
        if (schoolTypeData.name) {
            sanitized.name = this.sanitizeText(schoolTypeData.name, {
                maxLength: 100,
                escapeHtml: false
            });
        }

        if (schoolTypeData.slug) {
            sanitized.slug = this.sanitizeSlug(schoolTypeData.slug);
        }

        logger.debug('School type data sanitized', {
            originalFields: Object.keys(schoolTypeData),
            sanitizedFields: Object.keys(sanitized)
        });

        return sanitized;
    }

    // Comprehensive FAQs data sanitization
    static sanitizeFaqData(faqData) {
        const sanitized = {};

        // Sanitize each field
        if (faqData.question) {
            sanitized.question = this.sanitizeText(faqData.question, {
                maxLength: 1000,
                escapeHtml: false
            });
        }

        if (faqData.answer) {
            sanitized.answer = this.sanitizeText(faqData.answer, {
                maxLength: 5000,
                escapeHtml: false
            });
        }

        if (faqData.type) {
            const validTypes = ['school', 'general'];
            const type = this.sanitizeText(faqData.type, { maxLength: 20 });
            sanitized.type = validTypes.includes(type) ? type : 'general';
        }

        if (faqData.school_id) {
            sanitized.school_id = this.sanitizeNumber(faqData.school_id, {
                min: 1,
                max: 999999,
                default: null
            });
        }

        if (faqData.sort_order !== undefined) {
            sanitized.sort_order = this.sanitizeNumber(faqData.sort_order, {
                min: 0,
                max: 999999,
                default: 0
            });
        }

        if (faqData.is_active !== undefined) {
            sanitized.is_active = this.sanitizeBoolean(faqData.is_active, true);
        }

        logger.debug('FAQ data sanitized', {
            originalFields: Object.keys(faqData),
            sanitizedFields: Object.keys(sanitized)
        });

        return sanitized;
    }

    // Comprehensive school reviews data sanitization
    static sanitizeSchoolReviewData(reviewData) {
        const sanitized = {};
        const hasField = (fieldName) => Object.prototype.hasOwnProperty.call(reviewData || {}, fieldName);

        // Sanitize each field
        if (hasField('school_id')) {
            sanitized.school_id = this.sanitizeNumber(reviewData.school_id, {
                min: 1,
                max: 999999,
                default: null
            });
        }

        if (hasField('student_name')) {
            sanitized.student_name = this.sanitizeName(reviewData.student_name);
        }

        if (hasField('avatar_url')) {
            sanitized.avatar_url = this.sanitizeUrl(reviewData.avatar_url);
        }

        if (hasField('nationality')) {
            sanitized.nationality = this.sanitizeText(reviewData.nationality, {
                maxLength: 100,
                escapeHtml: false
            });
        }

        if (hasField('course_period')) {
            sanitized.course_period = this.sanitizeText(reviewData.course_period, {
                maxLength: 100,
                escapeHtml: false
            });
        }

        if (hasField('rating')) {
            sanitized.rating = this.sanitizeNumber(reviewData.rating, {
                min: 1,
                max: 5,
                default: 5
            });
        }

        if (hasField('content')) {
            sanitized.content = this.sanitizeText(reviewData.content, {
                maxLength: 2000,
                escapeHtml: false
            });
        }

        logger.debug('School review data sanitized', {
            originalFields: Object.keys(reviewData),
            sanitizedFields: Object.keys(sanitized)
        });

        return sanitized;
    }

    // Comprehensive general settings data sanitization
    static sanitizeGeneralSettingsData(settingsData) {
        const payload = settingsData || {};
        const sanitized = {};

        sanitized.siteName = this.sanitizeText(payload.siteName || '', {
            maxLength: 255,
            escapeHtml: false
        });

        sanitized.siteUrl = this.sanitizeUrl(payload.siteUrl || '');

        sanitized.siteLogoUrl = this.sanitizeUrl(payload.siteLogoUrl || '');
        sanitized.siteFaviconUrl = this.sanitizeUrl(payload.siteFaviconUrl || '');

        sanitized.siteDescription = this.sanitizeText(payload.siteDescription || '', {
            maxLength: 2000,
            escapeHtml: false
        });

        sanitized.siteCopyright = this.sanitizeText(payload.siteCopyright || '', {
            maxLength: 255,
            escapeHtml: false
        });

        sanitized.siteLanguage = this.sanitizeText(payload.siteLanguage || 'vi', {
            maxLength: 20,
            escapeHtml: false
        }).toLowerCase();

        sanitized.siteTimezone = this.sanitizeText(payload.siteTimezone || 'Asia/Ho_Chi_Minh', {
            maxLength: 100,
            escapeHtml: false
        });

        sanitized.dateFormat = this.sanitizeText(payload.dateFormat || 'dd/mm/yyyy', {
            maxLength: 20,
            escapeHtml: false
        }).toLowerCase();

        logger.debug('General settings data sanitized', {
            originalFields: Object.keys(payload),
            sanitizedFields: Object.keys(sanitized)
        });

        return sanitized;
    }

    static sanitizeContactSettingsData(settingsData) {
        const payload = settingsData || {};
        const sanitized = {};

        sanitized.companyFullName = this.sanitizeText(payload.companyFullName || '', {
            maxLength: 255,
            escapeHtml: false
        });

        sanitized.companyShortName = this.sanitizeText(payload.companyShortName || '', {
            maxLength: 100,
            escapeHtml: false
        });

        sanitized.contactEmail = '';
        const emailRaw = String(payload.contactEmail || '').trim();
        if (emailRaw) {
            sanitized.contactEmail = this.sanitizeEmail(emailRaw);
        }

        sanitized.phone = this.sanitizePhone(payload.phone || '');
        sanitized.hotline = this.sanitizePhone(payload.hotline || '');

        sanitized.address = this.sanitizeText(payload.address || '', {
            maxLength: 1000,
            escapeHtml: false
        });

        const mapRaw = String(payload.googleMapEmbedUrl || '').trim();
        let mapUrl = mapRaw;

        if (mapRaw && !/^https?:\/\//i.test(mapRaw)) {
            const match = mapRaw.match(/src=["']([^"']+)["']/i);
            mapUrl = match?.[1] || '';
        }

        sanitized.googleMapEmbedUrl = this.sanitizeUrl(mapUrl || '');

        sanitized.workingHours = this.sanitizeText(payload.workingHours || '', {
            maxLength: 2000,
            escapeHtml: false
        });

        logger.debug('Contact settings data sanitized', {
            originalFields: Object.keys(payload),
            sanitizedFields: Object.keys(sanitized)
        });

        return sanitized;
    }

    // Sanitize JSON data
    static sanitizeJSONData(jsonData) {
        if (typeof jsonData !== 'object' || jsonData === null) {
            return {};
        }

        const sanitized = {};

        for (const [key, value] of Object.entries(jsonData)) {
            const sanitizedKey = this.sanitizeText(key, { maxLength: 50 });
            
            if (typeof value === 'string') {
                sanitized[sanitizedKey] = this.sanitizeText(value, { maxLength: 500 });
            } else if (typeof value === 'number') {
                sanitized[sanitizedKey] = this.sanitizeNumber(value);
            } else if (typeof value === 'boolean') {
                sanitized[sanitizedKey] = this.sanitizeBoolean(value);
            } else if (Array.isArray(value)) {
                sanitized[sanitizedKey] = value.map(item => 
                    typeof item === 'string' ? this.sanitizeText(item, { maxLength: 200 }) : item
                ).slice(0, 50); // Limit array size
            }
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