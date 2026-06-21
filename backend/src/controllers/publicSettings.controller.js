import { logError } from "../utils/logger.js";
import { getPublicFooterData, getPublicGeneralSettingsData } from "../services/settings.service.js";

export const getPublicGeneralSettings = async (req, res) => {
    try {
        const data = await getPublicGeneralSettingsData();

        res.json({
            success: true,
            data
        });
    } catch (error) {
        logError("Get public general settings failed", error, {
            ip: req.ip
        });

        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ"
        });
    }
};

export const getPublicFooter = async (req, res) => {
    try {
        const data = await getPublicFooterData();

        res.json({
            success: true,
            data
        });
    } catch (error) {
        logError("Get public footer failed", error, {
            ip: req.ip
        });

        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ"
        });
    }
};