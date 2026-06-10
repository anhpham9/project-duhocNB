import db from "../../src/config/db.js";

const run = async () => {
    try {
        await db.query(`
            INSERT INTO permissions (name, description)
            VALUES
                -- News
                ('news.manage', 'Manage news'),
                ('news.create', 'Create news'),
                ('news.update', 'Update news'),
                ('news.delete', 'Delete news'),

                -- Contacts
                ('contact.manage', 'Manage contacts'),
                ('contact.update', 'Update contact status'),
                ('contact.delete', 'Delete contacts'),
                ('contact.note', 'Add/view contact notes'),

                -- Schools
                ('schools.manage', 'Manage schools'),
                ('schools.create', 'Create schools'),
                ('schools.update', 'Update schools'),
                ('schools.delete', 'Delete schools'),

                -- Users
                ('user.manage', 'Manage users'),
                ('user.create', 'Create users'),
                ('user.update', 'Update users'),
                ('user.delete', 'Delete users'),

                -- Settings
                ('settings.update', 'Update settings'),

                -- FAQs
                ('faqs.manage', 'Manage FAQs'),
                ('faqs.create', 'Create FAQs'),
                ('faqs.update', 'Update FAQs'),
                ('faqs.delete', 'Delete FAQs'),

                -- Reviews
                ('reviews.manage', 'Manage reviews'),
                ('reviews.create', 'Create reviews'),
                ('reviews.update', 'Update reviews'),
                ('reviews.delete', 'Delete reviews'),

                -- Static Pages
                ('static_pages.manage', 'Manage static pages'),
                ('static_pages.create', 'Create static pages'),
                ('static_pages.update', 'Update static pages'),
                ('static_pages.delete', 'Delete static pages'),

                -- Notifications
                ('notifications.view', 'View notifications'),
                ('notifications.manage', 'Manage notifications'),

                -- Files
                ('files.upload', 'Upload files'),
                ('files.delete', 'Delete files'),

                -- Audit Logs
                ('audit_logs.view', 'View audit logs')
            ON CONFLICT (name) DO NOTHING
        `);

        console.log("✅ Permissions seeded");
    } catch (err) {
        console.error("❌ Permissions seed error:", err.message);
    }
};

run();