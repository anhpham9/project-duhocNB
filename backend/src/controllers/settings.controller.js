import db from "../config/db.js";
import { logError, logInfo, auditLog } from "../utils/logger.js";
import { InputSanitizer } from "../utils/sanitizer.js";
import { SecurityLogger } from "../utils/securityLogger.js";
import {
    GENERAL_SETTINGS_KEYS,
    GENERAL_SETTINGS_DESCRIPTIONS,
    CONTACT_SETTINGS_KEYS,
    CONTACT_SETTINGS_DESCRIPTIONS,
    getGeneralSettingsData,
    getContactSettingsData
} from "../services/settings.service.js";

const MANAGE_SETTINGS_ROLES = [1, 2];

export const getGeneralSettings = async (req, res) => {
    try {
        const currentUserRole = req.user?.role_id;
        const currentUserId = req.user?.id;

        if (!MANAGE_SETTINGS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                "/api/settings/general",
                "GET",
                "settings.general.view"
            );

            return res.status(403).json({
                success: false,
                message: "Truy cập bị từ chối. Bạn không thể xem cài đặt."
            });
        }

        res.json({
            success: true,
            data: await getGeneralSettingsData()
        });
    } catch (error) {
        logError("Get general settings failed", error, {
            requesterId: req.user?.id
        });

        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ"
        });
    }
};

export const updateGeneralSettings = async (req, res) => {
    const currentUserRole = req.user?.role_id;
    const currentUserId = req.user?.id;

    try {
        if (!MANAGE_SETTINGS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                "/api/settings/general",
                "PUT",
                "settings.general.update"
            );

            return res.status(403).json({
                success: false,
                message: "Truy cập bị từ chối. Bạn không thể cập nhật cài đặt."
            });
        }

        const payload = InputSanitizer.sanitizeGeneralSettingsData(req.body || {});

        if (!payload.siteName) {
            return res.status(400).json({
                success: false,
                message: "Tên website là bắt buộc",
                errors: {
                    siteName: "Tên website là bắt buộc"
                }
            });
        }

        await db.query("BEGIN");

        const settingsEntries = [
            [GENERAL_SETTINGS_KEYS.siteName,              String(payload.siteName)],
            [GENERAL_SETTINGS_KEYS.siteUrl,               String(payload.siteUrl)],
            [GENERAL_SETTINGS_KEYS.siteLogoUrl,           String(payload.siteLogoUrl)],
            [GENERAL_SETTINGS_KEYS.siteFaviconUrl,       String(payload.siteFaviconUrl)],
            [GENERAL_SETTINGS_KEYS.siteDescription,       String(payload.siteDescription)]
        ];

        const placeholders = settingsEntries
            .map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`)
            .join(",\n                ");

        const values = settingsEntries.flatMap(([key, value]) => [
            key,
            value,
            GENERAL_SETTINGS_DESCRIPTIONS[key] || "",
            "general"
        ]);

        await db.query(
            `INSERT INTO settings (key, value, description, group_name)
             VALUES
                ${placeholders}
             ON CONFLICT (key)
             DO UPDATE SET
                value = EXCLUDED.value,
                description = EXCLUDED.description,
                group_name = EXCLUDED.group_name`,
            values
        );

        await db.query("COMMIT");

        auditLog("UPDATE_GENERAL_SETTINGS", currentUserId, {
            updatedFields: Object.keys(payload)
        }, req);

        logInfo("General settings updated", {
            updatedBy: currentUserId
        });

        res.json({
            success: true,
            message: "Đã cập nhật cài đặt chung thành công",
            data: payload
        });
    } catch (error) {
        try {
            await db.query("ROLLBACK");
        } catch (rollbackError) {
            logError("Rollback failed after update general settings error", rollbackError, {
                requesterId: currentUserId
            });
        }

        logError("Update general settings failed", error, {
            requesterId: currentUserId,
            targetData: req.body || {}
        });

        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ"
        });
    }
};

export const getContactSettings = async (req, res) => {
    try {
        const currentUserRole = req.user?.role_id;
        const currentUserId = req.user?.id;

        if (!MANAGE_SETTINGS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                "/api/settings/contact",
                "GET",
                "settings.contact.view"
            );

            return res.status(403).json({
                success: false,
                message: "Truy cập bị từ chối. Bạn không thể xem cài đặt liên hệ."
            });
        }

        res.json({
            success: true,
            data: await getContactSettingsData()
        });
    } catch (error) {
        logError("Get contact settings failed", error, {
            requesterId: req.user?.id
        });

        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ"
        });
    }
};

export const updateContactSettings = async (req, res) => {
    const currentUserRole = req.user?.role_id;
    const currentUserId = req.user?.id;

    try {
        if (!MANAGE_SETTINGS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                "/api/settings/contact",
                "PUT",
                "settings.contact.update"
            );

            return res.status(403).json({
                success: false,
                message: "Truy cập bị từ chối. Bạn không thể cập nhật cài đặt liên hệ."
            });
        }

        const payload = InputSanitizer.sanitizeContactSettingsData(req.body || {});

        if (String(req.body?.contactEmail || "").trim() && !payload.contactEmail) {
            return res.status(400).json({
                success: false,
                message: "Email không hợp lệ",
                errors: {
                    contactEmail: "Email không hợp lệ"
                }
            });
        }

        if (String(req.body?.address || "").trim() && !payload.address) {
            return res.status(400).json({
                success: false,
                message: "Địa chỉ không hợp lệ",
                errors: {
                    address: "Địa chỉ không hợp lệ"
                }
            });
        }

        await db.query("BEGIN");

        const settingsEntries = [
            [CONTACT_SETTINGS_KEYS.companyFullName, String(payload.companyFullName)],
            [CONTACT_SETTINGS_KEYS.companyShortName, String(payload.companyShortName)],
            [CONTACT_SETTINGS_KEYS.contactEmail, String(payload.contactEmail)],
            [CONTACT_SETTINGS_KEYS.phone, String(payload.phone)],
            [CONTACT_SETTINGS_KEYS.hotline, String(payload.hotline)],
            [CONTACT_SETTINGS_KEYS.address, String(payload.address)],
            [CONTACT_SETTINGS_KEYS.googleMapEmbedUrl, String(payload.googleMapEmbedUrl)],
            [CONTACT_SETTINGS_KEYS.workingHours, String(payload.workingHours)]
        ];

        const placeholders = settingsEntries
            .map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`)
            .join(",\n                ");

        const values = settingsEntries.flatMap(([key, value]) => [
            key,
            value,
            CONTACT_SETTINGS_DESCRIPTIONS[key] || "",
            "contact"
        ]);

        await db.query(
            `INSERT INTO settings (key, value, description, group_name)
             VALUES
                ${placeholders}
             ON CONFLICT (key)
             DO UPDATE SET
                value = EXCLUDED.value,
                description = EXCLUDED.description,
                group_name = EXCLUDED.group_name`,
            values
        );

        await db.query("COMMIT");

        auditLog("UPDATE_CONTACT_SETTINGS", currentUserId, {
            updatedFields: Object.keys(payload)
        }, req);

        res.json({
            success: true,
            message: "Đã cập nhật cài đặt liên hệ thành công",
            data: payload
        });
    } catch (error) {
        try {
            await db.query("ROLLBACK");
        } catch (rollbackError) {
            logError("Rollback failed after update contact settings error", rollbackError, {
                requesterId: currentUserId
            });
        }

        logError("Update contact settings failed", error, {
            requesterId: currentUserId,
            targetData: req.body || {}
        });

        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ"
        });
    }
};
