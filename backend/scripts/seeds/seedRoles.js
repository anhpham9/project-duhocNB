import db from "../../src/config/db.js";

const run = async () => {
    try {
        await db.query(`
        INSERT INTO roles (name, description)
        VALUES
            ('superadmin', 'Full system access'),
            ('admin', 'Manage system content'),
            ('manager', 'Manage users and content'),
            ('editor', 'Manage news'),
            ('consultant', 'Handle contacts')
        ON CONFLICT (name) DO NOTHING
        `);

        console.log("✅ Roles seeded");
    } catch (err) {
        console.error("❌ Roles seed error:", err.message);
    }
};

run();