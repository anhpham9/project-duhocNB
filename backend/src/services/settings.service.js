import db from "../config/db.js";
import { InputSanitizer } from "../utils/sanitizer.js";

export const GENERAL_SETTINGS_PREFIX = "general.";

export const GENERAL_SETTINGS_KEYS = {
    siteName: `${GENERAL_SETTINGS_PREFIX}site_name`,
    siteLogoUrl: `${GENERAL_SETTINGS_PREFIX}site_logo_url`,
    siteFaviconUrl: `${GENERAL_SETTINGS_PREFIX}site_favicon_url`,
    siteDescription: `${GENERAL_SETTINGS_PREFIX}site_description`,
    contactEmail: `${GENERAL_SETTINGS_PREFIX}contact_email`,
    phone: `${GENERAL_SETTINGS_PREFIX}phone`,
    hotline: `${GENERAL_SETTINGS_PREFIX}hotline`,
    address: `${GENERAL_SETTINGS_PREFIX}address`,
    googleMapIframe: `${GENERAL_SETTINGS_PREFIX}google_map_iframe`,
    maintenanceMode: `${GENERAL_SETTINGS_PREFIX}maintenance_mode`
};

export const GENERAL_SETTINGS_DESCRIPTIONS = {
    [GENERAL_SETTINGS_KEYS.siteName]: "General setting: website name",
    [GENERAL_SETTINGS_KEYS.siteLogoUrl]: "General setting: website logo URL",
    [GENERAL_SETTINGS_KEYS.siteFaviconUrl]: "General setting: website favicon URL",
    [GENERAL_SETTINGS_KEYS.siteDescription]: "General setting: website description",
    [GENERAL_SETTINGS_KEYS.contactEmail]: "General setting: contact email",
    [GENERAL_SETTINGS_KEYS.phone]: "General setting: contact phone",
    [GENERAL_SETTINGS_KEYS.hotline]: "General setting: hotline",
    [GENERAL_SETTINGS_KEYS.address]: "General setting: office address",
    [GENERAL_SETTINGS_KEYS.googleMapIframe]: "General setting: Google Map iframe",
    [GENERAL_SETTINGS_KEYS.maintenanceMode]: "General setting: maintenance mode"
};

export const getDefaultGeneralSettings = () => ({
    siteName: "",
    siteLogoUrl: "",
    siteFaviconUrl: "",
    siteDescription: "",
    contactEmail: "",
    phone: "",
    hotline: "",
    address: "",
    googleMapIframe: "",
    maintenanceMode: false
});

export const mapRowsToGeneralSettings = (rows = []) => {
    const data = getDefaultGeneralSettings();

    for (const row of rows) {
        if (row.key === GENERAL_SETTINGS_KEYS.siteName) data.siteName = row.value || "";
        if (row.key === GENERAL_SETTINGS_KEYS.siteLogoUrl) data.siteLogoUrl = row.value || "";
        if (row.key === GENERAL_SETTINGS_KEYS.siteFaviconUrl) data.siteFaviconUrl = row.value || "";
        if (row.key === GENERAL_SETTINGS_KEYS.siteDescription) data.siteDescription = row.value || "";
        if (row.key === GENERAL_SETTINGS_KEYS.contactEmail) data.contactEmail = row.value || "";
        if (row.key === GENERAL_SETTINGS_KEYS.phone) data.phone = row.value || "";
        if (row.key === GENERAL_SETTINGS_KEYS.hotline) data.hotline = row.value || "";
        if (row.key === GENERAL_SETTINGS_KEYS.address) data.address = row.value || "";
        if (row.key === GENERAL_SETTINGS_KEYS.googleMapIframe) data.googleMapIframe = row.value || "";
        if (row.key === GENERAL_SETTINGS_KEYS.maintenanceMode) {
            data.maintenanceMode = InputSanitizer.sanitizeBoolean(row.value, false);
        }
    }

    return data;
};

export const getGeneralSettingsRows = async (keys = Object.values(GENERAL_SETTINGS_KEYS)) => {
    const result = await db.query(
        `SELECT key, value
         FROM settings
         WHERE key = ANY($1::text[])`,
        [keys]
    );

    return result.rows;
};

export const getGeneralSettingsData = async (keys = Object.values(GENERAL_SETTINGS_KEYS)) => {
    const rows = await getGeneralSettingsRows(keys);
    return mapRowsToGeneralSettings(rows);
};

export const getPublicGeneralSettingsData = async () => {
    const publicKeys = [
        GENERAL_SETTINGS_KEYS.siteName,
        GENERAL_SETTINGS_KEYS.siteDescription,
        GENERAL_SETTINGS_KEYS.contactEmail,
        GENERAL_SETTINGS_KEYS.phone,
        GENERAL_SETTINGS_KEYS.hotline,
        GENERAL_SETTINGS_KEYS.address,
        GENERAL_SETTINGS_KEYS.googleMapIframe
    ];

    const data = await getGeneralSettingsData(publicKeys);

    return {
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        contactEmail: data.contactEmail,
        phone: data.phone,
        hotline: data.hotline,
        address: data.address,
        googleMapIframe: data.googleMapIframe
    };
};