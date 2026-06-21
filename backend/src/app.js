import "./config/env.js";
import { authenticate } from "./middlewares/auth.middleware.js";
import { requestLogger, logInfo } from "./utils/logger.js";
import { errorHandler, notFoundHandler } from "./utils/errorHandler.js";
import { rateLimiter } from "./middlewares/rateLimiter.js";
import { sanitizeInputs } from "./utils/sanitizer.js";


import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import session from "express-session";


import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import contactsRoutes from "./routes/contacts.routes.js";
import newsRoutes from "./routes/news.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import schoolsRoutes from "./routes/schools.routes.js";
import regionsRoutes from "./routes/regions.routes.js";
import schoolTypesRoutes from "./routes/schoolTypes.routes.js";
import faqsRoutes from "./routes/faqs.routes.js";
import schoolReviewsRoutes from "./routes/schoolReviews.routes.js";
import staticPagesRoutes from "./routes/staticPages.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import socialLinksRoutes from "./routes/socialLinks.routes.js";
import seoSettingsRoutes from "./routes/seoSettings.routes.js";
import { backupService } from "./services/backup.service.js";
// Bổ sung các route cho các bảng mở rộng
import notificationsRoutes from "./routes/notifications.routes.js";
// import notificationSettingsRoutes from "./routes/notificationSettings.routes.js";
// import filesRoutes from "./routes/files.routes.js";
// import auditLogsRoutes from "./routes/auditLogs.routes.js";
// import activityLogsRoutes from "./routes/activityLogs.routes.js";
import { getPublicStaticPageBySlug } from "./controllers/publicStaticPages.controller.js";
import { getPublicNewsBySlug, getPublicNewsList } from "./controllers/publicNews.controller.js";
import { trackNewsView } from "./controllers/news.controller.js";
import { ensureSettingsKeysExist } from "./services/settings.service.js";
import { ensureMediaAssetTableExists } from "./services/mediaAsset.service.js";


// RBAC/permission middleware mẫu
const checkPermission = (permission) => (req, res, next) => {
    // Giả sử req.user.permissions là mảng quyền
    if (req.user && req.user.permissions && req.user.permissions.includes(permission)) {
        return next();
    }
    return res.status(403).json({ success: false, message: "Forbidden: insufficient permissions" });
};

const app = express();

// Security headers
app.use(helmet({
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
    crossOriginEmbedderPolicy: false
}));


// CORS with credentials support (allowedOrigins từ biến môi trường)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


// Cookie parser for httpOnly cookies
app.use(cookieParser());
app.use(express.json());

// Session middleware (dùng cho session-based auth)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false } // secure: true nếu dùng HTTPS
}));

// Request logging middleware
app.use(requestLogger);

// Apply global rate limiting
app.use('/api/', rateLimiter.global);

// Public endpoints (no auth required)
// Import public contact function
import { submitPublicContact } from './controllers/contacts.controller.js';
import { getPublicFooter, getPublicGeneralSettings } from './controllers/publicSettings.controller.js';

// Public contact submission endpoint
app.get('/api/public/static-pages/:slug', getPublicStaticPageBySlug);
app.get('/api/public/general-settings', getPublicGeneralSettings);
app.get('/api/public/footer', getPublicFooter);
app.get('/api/public/news', getPublicNewsList);
app.get('/api/public/news/:slug', getPublicNewsBySlug);
app.post('/api/public/news/:id/view', rateLimiter.publicView, trackNewsView);

app.post('/api/public/contact', 
    rateLimiter.publicContact, 
    sanitizeInputs, 
    submitPublicContact
);

// test route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// auth routes
app.use("/api/auth", authRoutes);


// users CRUD routes (RBAC protected)
app.use("/api/users", authenticate, /*checkPermission('users:read')*/ usersRoutes);

// contacts CRUD routes (RBAC protected)
app.use("/api/contacts", authenticate, /*checkPermission('contacts:read')*/ contactsRoutes);

// news CRUD routes (RBAC protected)
app.use("/api/news", authenticate, /*checkPermission('news:read')*/ newsRoutes);

// categories of news CRUD routes (RBAC protected)
app.use("/api/categories", authenticate, /*checkPermission('categories:read')*/ categoriesRoutes);

// schools CRUD routes (RBAC protected)
app.use("/api/schools", authenticate, /*checkPermission('schools:read')*/ schoolsRoutes);

// regions of schools CRUD routes (RBAC protected)
app.use("/api/regions", authenticate, /*checkPermission('regions:read')*/ regionsRoutes);

// school types CRUD routes (RBAC protected)
app.use("/api/school-types", authenticate, /*checkPermission('school_types:read')*/ schoolTypesRoutes);

// FAQs CRUD routes (RBAC protected)
app.use("/api/faqs", authenticate, /*checkPermission('faqs:read')*/ faqsRoutes);

// school reviews CRUD routes (RBAC protected)
app.use("/api/school-reviews", authenticate, /*checkPermission('school_reviews:read')*/ schoolReviewsRoutes);

// static pages CRUD routes (RBAC protected)
app.use("/api/static-pages", authenticate, staticPagesRoutes);

// settings CRUD routes (RBAC protected)
app.use("/api/settings", authenticate, settingsRoutes);

// social links CRUD routes (RBAC protected)
app.use("/api/settings/socials", authenticate, socialLinksRoutes);
app.use("/api/settings/seo", authenticate, seoSettingsRoutes);

// notifications CRUD routes
app.use("/api/notifications", authenticate, notificationsRoutes);
// notification_settings CRUD routes
// app.use("/api/notification-settings", authenticate, notificationSettingsRoutes);
// files CRUD routes
// app.use("/api/files", authenticate, filesRoutes);
// audit_logs CRUD routes
// app.use("/api/audit-logs", authenticate, auditLogsRoutes);
// activity_logs CRUD routes
// app.use("/api/activity-logs", authenticate, activityLogsRoutes);

// test protected route
app.get("/api/me", authenticate, (req, res) => {
  res.json(req.user);
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    // Initialize settings keys in database
    await ensureMediaAssetTableExists();
    await ensureSettingsKeysExist();
    
    backupService.startBackupScheduler();

    logInfo('Server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});