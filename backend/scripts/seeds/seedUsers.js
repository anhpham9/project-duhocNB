import bcrypt from "bcrypt";
import db from "../../src/config/db.js";

const run = async () => {
    try {
        // Lấy role id theo name
        const roles = await db.query(`SELECT id, name FROM roles`);
        const roleMap = Object.fromEntries(roles.rows.map(r => [r.name, r.id]));

        const hash = await bcrypt.hash("123456", 10);
        const users = [];

        // 1 superadmin
        users.push(["Super Admin", "superadmin", "superadmin@example.com", hash, roleMap.superadmin]);

        // 3 admin
        for (let i = 1; i <= 3; i++) {
            users.push([
                `Admin User ${i}`,
                `admin${i}`,
                `admin${i}@example.com`,
                hash,
                roleMap.admin
            ]);
        }

        // 5 manager
        for (let i = 1; i <= 5; i++) {
            users.push([
                `Manager User ${i}`,
                `manager${i}`,
                `manager${i}@example.com`,
                hash,
                roleMap.manager
            ]);
        }

        // 10 editor
        for (let i = 1; i <= 10; i++) {
            users.push([
                `Editor User ${i}`,
                `editor${i}`,
                `editor${i}@example.com`,
                hash,
                roleMap.editor
            ]);
        }

        // 10 consultant
        for (let i = 1; i <= 10; i++) {
            users.push([
                `Consultant User ${i}`,
                `consultant${i}`,
                `consultant${i}@example.com`,
                hash,
                roleMap.consultant
            ]);
        }

        for (const [name, username, email, password, role_id] of users) {
            await db.query(
                `INSERT INTO users (name, username, email, password, role_id)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (username) DO NOTHING`,
                [name, username, email, password, role_id]
            );
        }

        console.log("✅ Users seeded");
    } catch (err) {
        console.error("❌ Users seed error:", err.message);
    }
};

run();