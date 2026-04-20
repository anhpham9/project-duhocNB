import express from "express";
import { login, logout, getAuthStatus } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { sanitizeInputs } from "../utils/sanitizer.js";

const router = express.Router();

router.post("/login", sanitizeInputs, login);
router.post("/logout", logout);
router.get("/me", authenticate, getAuthStatus);

export default router;