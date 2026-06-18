import db from "../config/db.js";
import { logError, logInfo, auditLog } from "../utils/logger.js";
import { InputSanitizer } from "../utils/sanitizer.js";
import { SecurityLogger } from "../utils/securityLogger.js";
import { getStaticPageDataBySlug } from "../services/staticPages.service.js";

const MANAGE_STATIC_PAGES_ROLES = [1, 2, 3];
const ALLOWED_STATUSES = ["draft", "published"];
const DYNAMIC_PAGE_SLUGS = ["home", "schools", "news", "contact"];

const resolvePageTypeBySlug = (slug) => {
    return DYNAMIC_PAGE_SLUGS.includes(slug) ? "dynamic" : "static";
};

const normalizeStatus = (status) => {
    const sanitized = InputSanitizer.sanitizeText(String(status || ""), { maxLength: 20 }).toLowerCase();
    return ALLOWED_STATUSES.includes(sanitized) ? sanitized : "draft";
};

const sanitizePagePayload = (payload = {}, slugFromPath = "") => {
    const title = InputSanitizer.sanitizeText(payload.title || "", {
        maxLength: 255,
        escapeHtml: false
    });
    const heroTitle = InputSanitizer.sanitizeText(payload.hero_title || "", {
        maxLength: 255,
        escapeHtml: false
    });
    const heroDescription = InputSanitizer.sanitizeText(payload.hero_description || "", {
        maxLength: 2000,
        escapeHtml: false
    });
    const metaTitle = InputSanitizer.sanitizeText(payload.meta_title || "", {
        maxLength: 255,
        escapeHtml: false
    });
    const metaDescription = InputSanitizer.sanitizeText(payload.meta_description || "", {
        maxLength: 2000,
        escapeHtml: false
    });
    const content = InputSanitizer.sanitizeText(payload.content || "", {
        maxLength: 50000,
        escapeHtml: false
    });

    const slug = InputSanitizer.sanitizeSlug(slugFromPath || payload.slug || "");
    const pageType = resolvePageTypeBySlug(slug);

    return {
        title,
        slug,
        hero_title: heroTitle,
        hero_description: heroDescription,
        meta_title: metaTitle,
        meta_description: metaDescription,
        type: pageType,
        status: normalizeStatus(payload.status),
        content
    };
};

export const getStaticPageBySlug = async (req, res) => {
    try {
        const currentUserRole = req.user?.role_id;
        const currentUserId = req.user?.id;
        const slug = InputSanitizer.sanitizeSlug(req.params.slug || "");

        if (!MANAGE_STATIC_PAGES_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/static-pages/${slug}`,
                "GET",
                "static_pages.view"
            );

            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions to view static pages."
            });
        }

        const page = await getStaticPageDataBySlug(slug);

        if (!page) {
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
        logError("Get static page by slug failed", error, {
            slug: req.params.slug,
            requesterId: req.user?.id
        });

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const upsertStaticPageBySlug = async (req, res) => {
    try {
        const currentUserRole = req.user?.role_id;
        const currentUserId = req.user?.id;
        const payload = sanitizePagePayload(req.body, req.params.slug);
        const shouldStoreContent = payload.type !== "dynamic" && Boolean((payload.content || "").trim());

        if (!MANAGE_STATIC_PAGES_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/static-pages/${payload.slug}`,
                "PUT",
                "static_pages.update"
            );

            return res.status(403).json({
                success: false,
                message: "Access denied. You cannot update static pages."
            });
        }

        if (!payload.slug) {
            return res.status(400).json({
                success: false,
                message: "Slug is required"
            });
        }

        if (!payload.title) {
            return res.status(400).json({
                success: false,
                message: "Page title is required",
                errors: {
                    title: "Tieu de trang la bat buoc"
                }
            });
        }

        logInfo("Static page upsert attempt", {
            slug: payload.slug,
            updatedBy: currentUserId,
            status: payload.status,
            pageType: payload.type,
            shouldStoreContent
        });

        const result = await db.query(
            `WITH upsert_page AS (
                INSERT INTO static_pages (
                    title,
                    slug,
                    hero_title,
                    hero_description,
                    meta_title,
                    meta_description,
                    type,
                    status,
                    updated_by,
                    updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
                ON CONFLICT (slug)
                DO UPDATE SET
                    title = EXCLUDED.title,
                    hero_title = EXCLUDED.hero_title,
                    hero_description = EXCLUDED.hero_description,
                    meta_title = EXCLUDED.meta_title,
                    meta_description = EXCLUDED.meta_description,
                    type = EXCLUDED.type,
                    status = EXCLUDED.status,
                    updated_by = EXCLUDED.updated_by,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING
                    id,
                    title,
                    slug,
                    hero_title,
                    hero_description,
                    meta_title,
                    meta_description,
                    type,
                    status,
                    updated_by,
                    created_at,
                    updated_at
            ), upsert_content AS (
                INSERT INTO page_contents (page_id, content, updated_at)
                SELECT id, $10, CURRENT_TIMESTAMP
                FROM upsert_page
                WHERE $11
                ON CONFLICT (page_id)
                DO UPDATE SET
                    content = EXCLUDED.content,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING page_id, content, updated_at
            ), delete_content AS (
                DELETE FROM page_contents
                WHERE page_id IN (SELECT id FROM upsert_page)
                  AND $12
                RETURNING page_id
            )
            SELECT
                p.id,
                p.title,
                p.slug,
                p.hero_title,
                p.hero_description,
                p.meta_title,
                p.meta_description,
                p.type,
                p.status,
                p.updated_by,
                p.created_at,
                p.updated_at,
                COALESCE(pc.content, '') AS content,
                pc.updated_at AS content_updated_at
            FROM upsert_page p
            LEFT JOIN page_contents pc ON pc.page_id = p.id`,
            [
                payload.title,
                payload.slug,
                payload.hero_title,
                payload.hero_description,
                payload.meta_title,
                payload.meta_description,
                payload.type,
                payload.status,
                currentUserId,
                payload.content,
                shouldStoreContent,
                !shouldStoreContent
            ]
        );

        const updatedPage = result.rows[0];

        auditLog("UPSERT_STATIC_PAGE", currentUserId, {
            pageId: updatedPage.id,
            slug: updatedPage.slug,
            status: updatedPage.status
        }, req);

        res.json({
            success: true,
            message: "Static page saved successfully",
            data: updatedPage
        });
    } catch (error) {
        logError("Upsert static page failed", error, {
            slug: req.params.slug,
            updatedBy: req.user?.id,
            targetData: req.body ? { ...req.body, content: req.body.content ? `[${String(req.body.content).length} chars]` : "" } : {}
        });

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
