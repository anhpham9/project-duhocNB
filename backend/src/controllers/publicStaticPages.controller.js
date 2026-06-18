import { logError } from "../utils/logger.js";
import { InputSanitizer } from "../utils/sanitizer.js";
import { getStaticPageDataBySlug } from "../services/staticPages.service.js";

export const getPublicStaticPageBySlug = async (req, res) => {
    try {
        const slug = InputSanitizer.sanitizeSlug(req.params.slug || "");

        if (!slug) {
            return res.status(400).json({
                success: false,
                message: "Slug is required"
            });
        }

        const page = await getStaticPageDataBySlug(slug);

        if (!page) {
            return res.status(404).json({
                success: false,
                message: "Static page not found"
            });
        }

        if (page.status && page.status !== "published") {
            return res.status(404).json({
                success: false,
                message: "Static page not found"
            });
        }

        res.json({
            success: true,
            data: page
        });
    } catch (error) {
        logError("Get public static page by slug failed", error, {
            slug: req.params.slug,
            ip: req.ip
        });

        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ"
        });
    }
};