import bcrypt from "bcrypt";
import db from "../config/db.js";
import { generateToken } from "../utils/jwt.js";
import { logInfo, logError, auditLog } from "../utils/logger.js";
import { InputSanitizer } from "../utils/sanitizer.js";
import { SecurityLogger } from "../utils/securityLogger.js";

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate required fields
        if (!username || !password) {
            logError('Login failed - Missing fields', new Error('Missing username or password'), {
                hasUsername: !!username,
                hasPassword: !!password,
                ip: req.ip
            });
            return res.status(400).json({ 
                success: false,
                message: "Username and password are required" 
            });
        }

        // Sanitize inputs
        const sanitizer = new InputSanitizer();
        const sanitizedUsername = sanitizer.sanitizeText(username);
        
        // Validate username format (prevent SQL injection attempts)
        if (!sanitizer.validateUsername(sanitizedUsername)) {
            logError('Login failed - Invalid username format', new Error('Username contains invalid characters'), {
                originalUsername: username,
                sanitizedUsername: sanitizedUsername,
                ip: req.ip
            });
            return res.status(400).json({ 
                success: false,
                message: "Invalid username format" 
            });
        }

        const result = await db.query(
            "SELECT * FROM users WHERE username = $1",
            [sanitizedUsername]
        );

        if (result.rows.length === 0) {
            SecurityLogger.logFailedLogin(
                sanitizedUsername, 
                req.ip, 
                req.get('User-Agent'), 
                'user_not_found'
            );
            
            logError('Login failed - User not found', new Error('Username not found'), {
                attemptedUsername: sanitizedUsername,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            return res.status(400).json({ 
                success: false,
                message: "Invalid username or password" 
            });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            SecurityLogger.logFailedLogin(
                user.username, 
                req.ip, 
                req.get('User-Agent'), 
                'wrong_password'
            );
            
            logError('Login failed - Wrong password', new Error('Password mismatch'), {
                userId: user.id,
                username: user.username,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            return res.status(400).json({ 
                success: false,
                message: "Invalid username or password" 
            });
        }

        // Check if user is active
        if (user.is_active === false) {
            SecurityLogger.logFailedLogin(
                user.username, 
                req.ip, 
                req.get('User-Agent'), 
                'account_disabled'
            );
            
            logError('Login failed - Account disabled', new Error('User account is disabled'), {
                userId: user.id,
                username: user.username,
                ip: req.ip
            });
            return res.status(403).json({ 
                success: false,
                message: "Your account has been disabled" 
            });
        }

        const token = generateToken(user);

        // Audit log successful login
        auditLog('LOGIN', user.id, {
            username: user.username,
            role: user.role_id,
            loginMethod: 'password'
        }, req);

        logInfo('User logged in successfully', {
            userId: user.id,
            username: user.username,
            ip: req.ip
        });

        // Set httpOnly cookie for security
        res.cookie('authToken', token, {
            httpOnly: true,        // Prevent XSS access
            secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
            sameSite: 'strict',    // CSRF protection
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        // Return user info without password
        const { password: userPassword, ...safeUser } = user;
        
        res.json({ 
            success: true,
            message: "Login successful",
            user: safeUser
            // Don't send token in body for security
        });
    } catch (error) {
        logError('Login failed - System error', error, {
            hasBody: !!req.body,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        return res.status(500).json({
            success: false,
            message: "Internal server error during login"
        });
    }
};

export const logout = (req, res) => {
    try {
        // Audit log successful logout (if user is authenticated)
        if (req.user) {
            auditLog('LOGOUT', req.user.id, {
                username: req.user.username
            }, req);

            logInfo('User logged out successfully', {
                userId: req.user.id,
                username: req.user.username,
                ip: req.ip
            });
        }

        res.clearCookie('authToken');
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    } catch (error) {
        logError('Logout failed', error, {
            userId: req.user?.id,
            ip: req.ip
        });
        
        // Still clear cookie even if logging fails
        res.clearCookie('authToken');
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    }
};

export const getAuthStatus = (req, res) => {
    // This endpoint is protected by authenticate middleware
    // If we reach here, user is authenticated
    const { password, ...safeUser } = req.user;
    
    res.json({
        success: true,
        authenticated: true,
        user: safeUser
    });
};