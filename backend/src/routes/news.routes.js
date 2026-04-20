import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import {
    getNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    getNewsStats,
    trackNewsView
} from "../controllers/news.controller.js";

const router = express.Router();

// Apply rate limiting to all news routes
router.use(rateLimiter.newsLimiter);

// Get news statistics (admin dashboard)
router.get("/stats", authenticate, getNewsStats);

// Track news view (public endpoint)
router.post("/:id/view", trackNewsView);

// Get all news (with filters)
router.get("/", authenticate, getNews);

// Get single news by ID
router.get("/:id", authenticate, getNewsById);

// Create new news
router.post("/", authenticate, createNews);

// Update news
router.put("/:id", authenticate, updateNews);

// Delete news (superadmin, admin only)
router.delete("/:id", authenticate, deleteNews);

export default router;