import "./config/env.js";
import { authenticate } from "./middlewares/auth.middleware.js";
import { requestLogger, logInfo } from "./utils/logger.js";
import { errorHandler, notFoundHandler } from "./utils/errorHandler.js";
import { rateLimiter } from "./middlewares/rateLimiter.js";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import contactsRoutes from "./routes/contacts.routes.js";
import newsRoutes from "./routes/news.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";

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

// CORS with credentials support
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
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
}));

// Cookie parser for httpOnly cookies
app.use(cookieParser());
app.use(express.json());

// Request logging middleware
app.use(requestLogger);

// Apply global rate limiting
app.use('/api/', rateLimiter.global);

// test route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// auth routes
app.use("/api/auth", authRoutes);

// users CRUD routes (RBAC protected)
app.use("/api/users", usersRoutes);

// contacts CRUD routes (RBAC protected)
app.use("/api/contacts", contactsRoutes);

// news CRUD routes (RBAC protected)
app.use("/api/news", newsRoutes);

// categories CRUD routes (RBAC protected)
app.use("/api/categories", categoriesRoutes);

// test protected route
app.get("/api/me", authenticate, (req, res) => {
  res.json(req.user);
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    logInfo('Server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});