# 🛡️ SECURITY IMPLEMENTATION GUIDE

## 📋 **OVERVIEW**
Hướng dẫn chi tiết implement các security improvements đã được xác định trong Security Audit. Thực hiện theo thứ tự ưu tiên để đảm bảo bảo mật tối đa.

---

## 🔴 **PRIORITY 1: CRITICAL SECURITY FIXES**

### **1. Secure Token Storage (HIGH PRIORITY)**

#### **Problem:** 
```javascript
// ❌ Current: localStorage vulnerable to XSS
const token = localStorage.getItem('token')
```

#### **Solution A: httpOnly Cookies (RECOMMENDED)**

**Backend Changes:**

1. Install required packages:
```bash
npm install cookie-parser
```

2. Update `app.js`:
```javascript
import cookieParser from 'cookie-parser';

app.use(cookieParser());
```

3. Modify `auth.controller.js` login method:
```javascript
// In login success response
res.cookie('authToken', token, {
    httpOnly: true,        // Prevent XSS access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict',    // CSRF protection
    maxAge: 24 * 60 * 60 * 1000 // 1 day
});

res.json({
    success: true,
    message: "Login successful",
    user: safeUser
    // Don't send token in body anymore
});
```

4. Update `auth.middleware.js`:
```javascript
const authenticateToken = (req, res, next) => {
    // Check cookie first, then header (for API testing)
    const token = req.cookies.authToken || 
                  req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token is required'
        });
    }
    
    // Rest of verification logic...
};
```

**Frontend Changes:**

5. Update `useUsersAPI.js` - remove localStorage:
```javascript
// Remove these lines:
// const token = localStorage.getItem('token')

// Update getAuthHeaders:
const getAuthHeaders = () => ({
    'Content-Type': 'application/json'
    // Cookie will be sent automatically by browser
});

// Update logout method:
const logout = async () => {
    try {
        // Call backend logout to clear cookie
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include' // Include cookies
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
};
```

6. Add logout endpoint in `auth.routes.js`:
```javascript
router.post('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.json({ success: true, message: 'Logged out successfully' });
});
```

#### **Solution B: Secure Session Storage (Alternative)**
```javascript
// If cookies are not suitable, use secure session storage
const SecureStorage = {
    setToken: (token) => {
        sessionStorage.setItem('authToken', token);
    },
    
    getToken: () => {
        return sessionStorage.getItem('authToken');
    },
    
    removeToken: () => {
        sessionStorage.removeItem('authToken');
    }
};
```

---

### **2. Rate Limiting Implementation**

#### **Install Dependencies:**
```bash
npm install express-rate-limit
```

#### **Backend Implementation:**

1. Update `app.js` with security config:
```javascript
import { setupSecurity } from './config/security.config.js';

// Apply security middleware
setupSecurity(app);
```

2. The `security.config.js` file (already created) provides:
   - General API rate limiting (100 requests/15min)
   - Auth endpoints rate limiting (5 attempts/15min)
   - User management rate limiting (10 requests/min)

#### **Test Rate Limiting:**
```bash
# Test with curl to verify rate limiting works
for i in {1..10}; do curl -X POST http://localhost:5000/api/auth/login; done
```

---

### **3. Security Headers with Helmet**

#### **Install Dependencies:**
```bash
npm install helmet cors
```

#### **Implementation:**
The `security.config.js` file includes comprehensive security headers:
- Content Security Policy (CSP)
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Strict-Transport-Security (HSTS)

---

## 🟡 **PRIORITY 2: MEDIUM SECURITY IMPROVEMENTS**

### **1. Implement Proper Logging**

#### **Install Winston:**
```bash
npm install winston
```

#### **Backend Changes:**

1. Replace all `console.log` and `console.error` with logger:
```javascript
import { logger, auditLog } from '../config/security.config.js';

// Before:
// console.error("Create user error:", error);

// After:
logger.error('User creation failed', { 
    error: error.message, 
    stack: error.stack,
    userId: req.user?.id 
});

// For audit trails:
auditLog('CREATE_USER', req.user.id, newUser.id, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
});
```

2. Update `users.controller.js` with proper logging:
```javascript
const createUser = async (req, res) => {
    try {
        // ... existing code ...
        
        auditLog('CREATE_USER', req.user.id, result.id, {
            ip: req.ip,
            targetUsername: result.username
        });
        
        logger.info('User created successfully', { 
            createdBy: req.user.id, 
            newUserId: result.id 
        });
        
    } catch (error) {
        logger.error('User creation failed', {
            error: error.message,
            createdBy: req.user.id,
            requestData: { ...req.body, password: '[REDACTED]' }
        });
        // ... rest of error handling
    }
};
```

#### **Create Log Directory:**
```bash
mkdir logs
echo "logs/" >> .gitignore  # Don't commit log files
```

---

### **2. Input Sanitization**

#### **Install Dependencies:**
```bash
npm install validator xss
```

#### **Update `users.controller.js`:**
```javascript
import { sanitize } from '../config/security.config.js';

const createUser = async (req, res) => {
    try {
        // Sanitize inputs
        const userData = {
            name: sanitize.name(req.body.name),
            username: sanitize.username(req.body.username),
            email: sanitize.email(req.body.email),
            phone: sanitize.phone(req.body.phone),
            password: req.body.password, // Don't sanitize password
            role_id: parseInt(req.body.role_id),
            is_active: Boolean(req.body.is_active)
        };
        
        // ... rest of validation and creation logic
    } catch (error) {
        // ... error handling
    }
};
```

---

### **3. Environment Configuration**

#### **Update Package.json Scripts:**
```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "validate-env": "node -e \"require('./src/config/security.config.js').validateEnv()\"",
    "test": "npm run validate-env && echo 'Environment validation passed'"
  }
}
```

#### **Create Production .env:**
```bash
# Copy example and fill production values
cp .env.example .env

# Generate secure JWT secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🟢 **PRIORITY 3: MONITORING & AUDITING**

### **1. API Documentation with Security Guidelines**

Create `API_SECURITY.md`:
```markdown
# API Security Guidelines

## Authentication
- All endpoints require valid JWT token
- Use Bearer token in Authorization header
- Tokens expire after 24 hours

## Rate Limits
- General API: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes  
- User Management: 10 requests per minute

## Error Handling
- Never expose internal system details
- Log all security-related events
- Return consistent error format
```

### **2. Security Monitoring**

#### **Add Security Event Logging:**
```javascript
// In auth.middleware.js
const authenticateToken = (req, res, next) => {
    const token = req.cookies.authToken || 
                  req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        logger.warn('Unauthorized access attempt', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.originalUrl
        });
        
        return res.status(401).json({
            success: false,
            message: 'Access token is required'
        });
    }
    
    // ... rest of verification
};
```

---

## 🧪 **TESTING SECURITY IMPLEMENTATIONS**

### **1. Manual Security Tests**

#### **Test Rate Limiting:**
```bash
# Should block after 5 attempts
for i in {1..10}; do
    curl -X POST http://localhost:5000/api/auth/login \
         -H "Content-Type: application/json" \
         -d '{"username":"test","password":"wrong"}' \
         -w " - Status: %{http_code}\n"
done
```

#### **Test CORS:**
```bash
# Should be blocked from unauthorized domain
curl -X GET http://localhost:5000/api/users \
     -H "Origin: https://malicious-site.com" \
     -H "Authorization: Bearer valid-token"
```

#### **Test Input Sanitization:**
```bash
# Should sanitize HTML in name field
curl -X POST http://localhost:5000/api/users \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer valid-token" \
     -d '{"name":"<script>alert(\"xss\")</script>John Doe"}'
```

### **2. Automated Security Testing**

#### **Install Security Testing Tools:**
```bash
# Optional: Add security testing
npm install --save-dev jest supertest
```

#### **Create Security Test Suite:**
```javascript
// tests/security.test.js
import request from 'supertest';
import app from '../src/app.js';

describe('Security Tests', () => {
    test('Rate limiting works', async () => {
        const promises = Array(10).fill().map(() =>
            request(app)
                .post('/api/auth/login')
                .send({ username: 'test', password: 'wrong' })
        );
        
        const responses = await Promise.all(promises);
        const blockedResponses = responses.filter(r => r.status === 429);
        expect(blockedResponses.length).toBeGreaterThan(0);
    });
    
    test('Security headers present', async () => {
        const response = await request(app).get('/api/users');
        expect(response.headers['x-frame-options']).toBeDefined();
        expect(response.headers['x-xss-protection']).toBeDefined();
    });
});
```

---

## ✅ **IMPLEMENTATION CHECKLIST**

### **Phase 1: Critical Security (Week 1)**
- [ ] Implement httpOnly cookie authentication
- [ ] Add rate limiting middleware
- [ ] Configure security headers with Helmet
- [ ] Update environment configuration
- [ ] Test all security measures

### **Phase 2: Improvements (Week 2)**
- [ ] Replace console logs with Winston logger
- [ ] Add input sanitization
- [ ] Implement audit logging
- [ ] Create API documentation
- [ ] Add security monitoring

### **Phase 3: Testing & Documentation (Week 3)**
- [ ] Write automated security tests
- [ ] Document security procedures
- [ ] Create deployment security checklist
- [ ] Review and update security policies

---

## 🚨 **DEPLOYMENT SECURITY CHECKLIST**

### **Before Production:**
- [ ] Generate strong JWT secret (32+ characters)
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure production database with restricted access
- [ ] Set up log rotation and monitoring
- [ ] Test all security measures in staging environment
- [ ] Review and update CORS origins for production domains
- [ ] Enable firewall and restrict server access
- [ ] Set up backup and recovery procedures

### **Post-Deployment Monitoring:**
- [ ] Monitor logs for suspicious activities
- [ ] Set up alerts for failed login attempts
- [ ] Regular security audits and updates
- [ ] Performance monitoring for rate limiting
- [ ] Database security and access audits

---

**📞 Support:** If you encounter issues implementing these security measures, refer to the detailed error logs in `logs/error.log` and check the Security Audit Report for specific guidance.