import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { sanitizeInputs } from "../utils/sanitizer.js";
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getAvailableRoles,
    resetPassword
} from "../controllers/users.controller.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/users - Get all users (with RBAC filtering)
router.get("/", getUsers);

// GET /api/users/roles - Get available roles for current user
router.get("/roles", getAvailableRoles);

// GET /api/users/:id - Get single user
router.get("/:id", getUser);

// POST /api/users - Create new user
router.post("/", sanitizeInputs, createUser);

// PUT /api/users/:id - Update user
router.put("/:id", sanitizeInputs, updateUser);

// POST /api/users/:id/reset-password - Reset user password
router.post("/:id/reset-password", sanitizeInputs, resetPassword);

// DELETE /api/users/:id - Delete user
router.delete("/:id", deleteUser);

export default router;