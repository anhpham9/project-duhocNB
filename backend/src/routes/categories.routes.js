import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} from "../controllers/categories.controller.js";

const router = express.Router();

// Apply rate limiting to all category routes
router.use(rateLimiter.categoriesLimiter);

// Get all categories
router.get("/", authenticate, getCategories);

// Get single category by ID
router.get("/:id", authenticate, getCategoryById);

// Create new category (superadmin, admin, manager only)
router.post("/", authenticate, createCategory);

// Update category (superadmin, admin, manager only)
router.put("/:id", authenticate, updateCategory);

// Delete category (superadmin, admin, manager only)
router.delete("/:id", authenticate, deleteCategory);

export default router;