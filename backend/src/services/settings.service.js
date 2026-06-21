import db from "../config/db.js";
import { InputSanitizer } from "../utils/sanitizer.js";

export const GENERAL_SETTINGS_PREFIX = "general.";
export const CONTACT_SETTINGS_PREFIX = "contact.";

export const GENERAL_SETTINGS_KEYS = {
    siteName: `${GENERAL_SETTINGS_PREFIX}site_name`,
    siteUrl: `${GENERAL_SETTINGS_PREFIX}site_url`,
    siteLogoUrl: `${GENERAL_SETTINGS_PREFIX}site_logo_url`,
    siteFaviconUrl: `${GENERAL_SETTINGS_PREFIX}site_favicon_url`,
    siteDescription: `${GENERAL_SETTINGS_PREFIX}site_description`,
    siteCopyright: `${GENERAL_SETTINGS_PREFIX}site_copyright`,
    siteLanguage: `${GENERAL_SETTINGS_PREFIX}site_language`,
    siteTimezone: `${GENERAL_SETTINGS_PREFIX}site_timezone`,
    dateFormat: `${GENERAL_SETTINGS_PREFIX}date_format`
};

export const CONTACT_SETTINGS_KEYS = {
    companyFullName: `${CONTACT_SETTINGS_PREFIX}company_full_name`,
    companyShortName: `${CONTACT_SETTINGS_PREFIX}company_short_name`,
    contactEmail: `${CONTACT_SETTINGS_PREFIX}contact_email`,
    phone: `${CONTACT_SETTINGS_PREFIX}phone`,
    hotline: `${CONTACT_SETTINGS_PREFIX}hotline`,
    address: `${CONTACT_SETTINGS_PREFIX}address`,
    googleMapEmbedUrl: `${CONTACT_SETTINGS_PREFIX}google_map_embed_url`,
    workingHours: `${CONTACT_SETTINGS_PREFIX}working_hours`
};

export const GENERAL_SETTINGS_DESCRIPTIONS = {
    [GENERAL_SETTINGS_KEYS.siteName]: "General setting: website name",
    [GENERAL_SETTINGS_KEYS.siteUrl]: "General setting: website url",
    [GENERAL_SETTINGS_KEYS.siteLogoUrl]: "General setting: website logo URL",
    [GENERAL_SETTINGS_KEYS.siteFaviconUrl]: "General setting: website favicon URL",
    [GENERAL_SETTINGS_KEYS.siteDescription]: "General setting: website description",
    [GENERAL_SETTINGS_KEYS.siteCopyright]: "General setting: website copyright",
    [GENERAL_SETTINGS_KEYS.siteLanguage]: "General setting: site language",
    [GENERAL_SETTINGS_KEYS.siteTimezone]: "General setting: site timezone",
    [GENERAL_SETTINGS_KEYS.dateFormat]: "General setting: date format"
};

export const CONTACT_SETTINGS_DESCRIPTIONS = {
    [CONTACT_SETTINGS_KEYS.companyFullName]: "Contact setting: full company name",
    [CONTACT_SETTINGS_KEYS.companyShortName]: "Contact setting: short company name",
    [CONTACT_SETTINGS_KEYS.contactEmail]: "Contact setting: contact email",
    [CONTACT_SETTINGS_KEYS.phone]: "Contact setting: phone",
    [CONTACT_SETTINGS_KEYS.hotline]: "Contact setting: hotline",
    [CONTACT_SETTINGS_KEYS.address]: "Contact setting: office address",
    [CONTACT_SETTINGS_KEYS.googleMapEmbedUrl]: "Contact setting: Google Map embed URL",
    [CONTACT_SETTINGS_KEYS.workingHours]: "Contact setting: working hours"
};

export const getDefaultGeneralSettings = () => ({
    siteName: "",
    siteUrl: "",
    siteLogoUrl: "",
    siteFaviconUrl: "",
    siteDescription: "",
    siteCopyright: "",
    siteLanguage: "vi",
    siteTimezone: "Asia/Ho_Chi_Minh",
    dateFormat: "dd/mm/yyyy"
});

export const getDefaultContactSettings = () => ({
    companyFullName: "",
    companyShortName: "",
    contactEmail: "",
    phone: "",
    hotline: "",
    address: "",
    googleMapEmbedUrl: "",
    workingHours: ""
});

export const mapRowsToGeneralSettings = (rows = []) => {
    const data = getDefaultGeneralSettings();

    for (const row of rows) {
        if (row.key === GENERAL_SETTINGS_KEYS.siteName) data.siteName = row.value || "";
        if (row.key === GENERAL_SETTINGS_KEYS.siteUrl) data.siteUrl = row.value || "";
        if (row.key === GENERAL_SETTINGS_KEYS.siteLogoUrl) data.siteLogoUrl = row.value || "";
        if (row.key === GENERAL_SETTINGS_KEYS.siteFaviconUrl) data.siteFaviconUrl = row.value || "";
        if (row.key === GENERAL_SETTINGS_KEYS.siteDescription) data.siteDescription = row.value || "";
        if (row.key === GENERAL_SETTINGS_KEYS.siteCopyright) data.siteCopyright = row.value || "";
        if (row.key === GENERAL_SETTINGS_KEYS.siteLanguage) data.siteLanguage = row.value || "vi";
        if (row.key === GENERAL_SETTINGS_KEYS.siteTimezone) data.siteTimezone = row.value || "Asia/Ho_Chi_Minh";
        if (row.key === GENERAL_SETTINGS_KEYS.dateFormat) data.dateFormat = row.value || "dd/mm/yyyy";
    }

    return data;
};

export const mapRowsToContactSettings = (rows = []) => {
    const data = getDefaultContactSettings();

    for (const row of rows) {
        if (row.key === CONTACT_SETTINGS_KEYS.companyFullName) data.companyFullName = row.value || "";
        if (row.key === CONTACT_SETTINGS_KEYS.companyShortName) data.companyShortName = row.value || "";
        if (row.key === CONTACT_SETTINGS_KEYS.contactEmail) data.contactEmail = row.value || "";
        if (row.key === CONTACT_SETTINGS_KEYS.phone) data.phone = row.value || "";
        if (row.key === CONTACT_SETTINGS_KEYS.hotline) data.hotline = row.value || "";
        if (row.key === CONTACT_SETTINGS_KEYS.address) data.address = row.value || "";
        if (row.key === CONTACT_SETTINGS_KEYS.googleMapEmbedUrl) data.googleMapEmbedUrl = row.value || "";
        if (row.key === CONTACT_SETTINGS_KEYS.workingHours) data.workingHours = row.value || "";
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

export const getContactSettingsData = async (keys = Object.values(CONTACT_SETTINGS_KEYS)) => {
    const rows = await getGeneralSettingsRows(keys);
    return mapRowsToContactSettings(rows);
};

export const ensureSettingsKeysExist = async () => {
    try {
        const allKeys = [
            ...Object.values(GENERAL_SETTINGS_KEYS),
            ...Object.values(CONTACT_SETTINGS_KEYS)
        ];

        const SEO_SETTINGS_PREFIX = "seo.";
        const seoKeys = [
            `${SEO_SETTINGS_PREFIX}default_title`,
            `${SEO_SETTINGS_PREFIX}default_description`,
            `${SEO_SETTINGS_PREFIX}default_og_image`,
            `${SEO_SETTINGS_PREFIX}facebook_app_id`
        ];

        const keysToEnsure = [
            ...allKeys.map(key => ({
                key,
                group: key.startsWith(GENERAL_SETTINGS_PREFIX)
                    ? 'general'
                    : key.startsWith(CONTACT_SETTINGS_PREFIX)
                    ? 'contact'
                    : 'seo'
            })),
            ...seoKeys.map(key => ({ key, group: 'seo' }))
        ];

        for (const { key, group } of keysToEnsure) {
            await db.query(
                `INSERT INTO settings (key, value, description, group_name)
                 VALUES ($1, '', '', $2)
                 ON CONFLICT (key) DO NOTHING`,
                [key, group]
            );
        }

        console.log('✓ Settings keys initialized');
    } catch (error) {
        console.error('Error initializing settings keys:', error.message);
    }
};

export const getPublicGeneralSettingsData = async () => {
    const [generalData, contactData] = await Promise.all([
        getGeneralSettingsData([
            GENERAL_SETTINGS_KEYS.siteName,
            GENERAL_SETTINGS_KEYS.siteUrl,
            GENERAL_SETTINGS_KEYS.siteLogoUrl,
            GENERAL_SETTINGS_KEYS.siteFaviconUrl,
            GENERAL_SETTINGS_KEYS.siteDescription,
            GENERAL_SETTINGS_KEYS.siteCopyright,
            GENERAL_SETTINGS_KEYS.siteLanguage,
            GENERAL_SETTINGS_KEYS.siteTimezone,
            GENERAL_SETTINGS_KEYS.dateFormat
        ]),
        getContactSettingsData()
    ]);

    return {
        siteName: generalData.siteName,
        siteUrl: generalData.siteUrl,
        siteLogoUrl: generalData.siteLogoUrl,
        siteFaviconUrl: generalData.siteFaviconUrl,
        siteDescription: generalData.siteDescription,
        siteCopyright: generalData.siteCopyright,
        siteLanguage: generalData.siteLanguage,
        siteTimezone: generalData.siteTimezone,
        dateFormat: generalData.dateFormat,
        companyFullName: contactData.companyFullName,
        companyShortName: contactData.companyShortName,
        contactEmail: contactData.contactEmail,
        phone: contactData.phone,
        hotline: contactData.hotline,
        address: contactData.address,
        googleMapEmbedUrl: contactData.googleMapEmbedUrl,
        workingHours: contactData.workingHours
    };
};

export const getPublicFooterData = async () => {
    const [generalData, contactData, socialLinksResult] = await Promise.all([
        getGeneralSettingsData([
            GENERAL_SETTINGS_KEYS.siteName,
            GENERAL_SETTINGS_KEYS.siteLogoUrl,
            GENERAL_SETTINGS_KEYS.siteUrl,
            GENERAL_SETTINGS_KEYS.siteDescription,
            GENERAL_SETTINGS_KEYS.siteCopyright
        ]),
        getContactSettingsData([
            CONTACT_SETTINGS_KEYS.companyFullName,
            CONTACT_SETTINGS_KEYS.companyShortName,
            CONTACT_SETTINGS_KEYS.contactEmail,
            CONTACT_SETTINGS_KEYS.phone,
            CONTACT_SETTINGS_KEYS.hotline,
            CONTACT_SETTINGS_KEYS.address
        ]),
        db.query(
            `SELECT id, name, icon, url, description, display_order
             FROM social_links
             WHERE is_active = TRUE
               ORDER BY display_order ASC, id ASC
               LIMIT 5`
        )
    ]);

    const socialLinks = (socialLinksResult.rows || []).map((item) => ({
        id: item.id,
        name: item.name || '',
        icon: item.icon || '',
        url: item.url || '',
        description: item.description || ''
    }));

    return {
        siteName: generalData.siteName,
        siteLogoUrl: generalData.siteLogoUrl,
        siteUrl: generalData.siteUrl,
        siteDescription: generalData.siteDescription,
        siteCopyright: generalData.siteCopyright,
        companyFullName: contactData.companyFullName,
        companyShortName: contactData.companyShortName,
        contactEmail: contactData.contactEmail,
        phone: contactData.phone,
        hotline: contactData.hotline,
        address: contactData.address,
        socialLinks
    };
};