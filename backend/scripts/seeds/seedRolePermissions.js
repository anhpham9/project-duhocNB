import db from "../../src/config/db.js";

const run = async () => {
    try {
        // Lấy roles và permissions theo id + name
        const roles = await db.query(`SELECT id, name FROM roles`);
        const permissions = await db.query(`SELECT id, name FROM permissions`);

        const roleMap = Object.fromEntries(roles.rows.map(r => [r.name, r.id]));
        const permMap = Object.fromEntries(permissions.rows.map(p => [p.name, p.id]));

        const data = [
            // Superadmin: full quyền (nên seed riêng nếu muốn)
            // Admin
            [roleMap.admin, permMap["news.manage"]],
            [roleMap.admin, permMap["news.create"]],
            [roleMap.admin, permMap["news.update"]],
            [roleMap.admin, permMap["news.delete"]],
            [roleMap.admin, permMap["contact.manage"]],
            [roleMap.admin, permMap["contact.update"]],
            [roleMap.admin, permMap["contact.delete"]],
            [roleMap.admin, permMap["contact.note"]],
            [roleMap.admin, permMap["schools.manage"]],
            [roleMap.admin, permMap["schools.create"]],
            [roleMap.admin, permMap["schools.update"]],
            [roleMap.admin, permMap["schools.delete"]],
            [roleMap.admin, permMap["user.manage"]],
            [roleMap.admin, permMap["user.create"]],
            [roleMap.admin, permMap["user.update"]],
            [roleMap.admin, permMap["user.delete"]],
            [roleMap.admin, permMap["settings.update"]],
            [roleMap.admin, permMap["faqs.manage"]],
            [roleMap.admin, permMap["faqs.create"]],
            [roleMap.admin, permMap["faqs.update"]],
            [roleMap.admin, permMap["faqs.delete"]],
            [roleMap.admin, permMap["reviews.manage"]],
            [roleMap.admin, permMap["reviews.create"]],
            [roleMap.admin, permMap["reviews.update"]],
            [roleMap.admin, permMap["reviews.delete"]],
            [roleMap.admin, permMap["static_pages.manage"]],
            [roleMap.admin, permMap["static_pages.create"]],
            [roleMap.admin, permMap["static_pages.update"]],
            [roleMap.admin, permMap["static_pages.delete"]],
            [roleMap.admin, permMap["notifications.view"]],
            [roleMap.admin, permMap["notifications.manage"]],
            [roleMap.admin, permMap["files.upload"]],
            [roleMap.admin, permMap["files.delete"]],
            [roleMap.admin, permMap["audit_logs.view"]],

            // Manager
            [roleMap.manager, permMap["news.manage"]],
            [roleMap.manager, permMap["news.create"]],
            [roleMap.manager, permMap["news.update"]],
            [roleMap.manager, permMap["contact.manage"]],
            [roleMap.manager, permMap["contact.update"]],
            [roleMap.manager, permMap["contact.note"]],
            [roleMap.manager, permMap["schools.manage"]],
            [roleMap.manager, permMap["schools.create"]],
            [roleMap.manager, permMap["schools.update"]],
            [roleMap.manager, permMap["user.manage"]],
            [roleMap.manager, permMap["user.create"]],
            [roleMap.manager, permMap["user.update"]],
            [roleMap.manager, permMap["settings.update"]],
            [roleMap.manager, permMap["faqs.manage"]],
            [roleMap.manager, permMap["faqs.create"]],
            [roleMap.manager, permMap["faqs.update"]],
            [roleMap.manager, permMap["reviews.manage"]],
            [roleMap.manager, permMap["reviews.create"]],
            [roleMap.manager, permMap["reviews.update"]],
            [roleMap.manager, permMap["static_pages.manage"]],
            [roleMap.manager, permMap["static_pages.create"]],
            [roleMap.manager, permMap["static_pages.update"]],
            [roleMap.manager, permMap["notifications.view"]],
            [roleMap.manager, permMap["files.upload"]],
            [roleMap.manager, permMap["audit_logs.view"]],

            // Editor
            [roleMap.editor, permMap["news.manage"]],
            [roleMap.editor, permMap["news.create"]],
            [roleMap.editor, permMap["news.update"]],
            [roleMap.editor, permMap["faqs.manage"]],
            [roleMap.editor, permMap["faqs.create"]],
            [roleMap.editor, permMap["faqs.update"]],
            [roleMap.editor, permMap["reviews.manage"]],
            [roleMap.editor, permMap["reviews.create"]],
            [roleMap.editor, permMap["reviews.update"]],
            [roleMap.editor, permMap["static_pages.manage"]],
            [roleMap.editor, permMap["static_pages.create"]],
            [roleMap.editor, permMap["static_pages.update"]],
            [roleMap.editor, permMap["notifications.view"]],
            [roleMap.editor, permMap["files.upload"]],

            // Consultant
            [roleMap.consultant, permMap["contact.manage"]],
            [roleMap.consultant, permMap["contact.update"]],
            [roleMap.consultant, permMap["contact.note"]],
            [roleMap.consultant, permMap["notifications.view"]]
        ];

        for (const [role_id, permission_id] of data) {
            if (role_id && permission_id) {
                await db.query(
                    `INSERT INTO role_permissions (role_id, permission_id)
                    VALUES ($1, $2)
                    ON CONFLICT DO NOTHING`,
                    [role_id, permission_id]
                );
            }
        }

        console.log("✅ Role-Permissions seeded");
    } catch (err) {
        console.error("❌ RolePermissions seed error:", err.message);
    }
};

run();