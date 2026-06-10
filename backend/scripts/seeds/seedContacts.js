import db from "../../src/config/db.js";

const run = async () => {
    try {
        // Lấy user id để assign
        const users = await db.query(`SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name IN ('admin','manager','consultant')`);
        const userIds = users.rows.map(u => u.id);
        if (userIds.length === 0) {
            console.log("❌ Cần seed users trước!");
            return;
        }
        const statusArr = ['new', 'pending', 'responded', 'closed'];
        const methodArr = ['phone', 'email', 'social'];
        const contacts = [];
        for (let i = 1; i <= 50; i++) {
            contacts.push([
                `Contact ${i}`,
                `contact${i}@example.com`,
                `090${1000000 + i}`,
                `Khách hàng số ${i} cần tư vấn du học Nhật Bản.`,
                statusArr[i % statusArr.length],
                methodArr[i % methodArr.length],
                methodArr[i % methodArr.length] === 'social' ? `@contact${i}` : null,
                userIds[i % userIds.length],
                new Date(),
                null,
                new Date(),
                new Date()
            ]);
        }
        for (const c of contacts) {
            await db.query(
                `INSERT INTO contacts (name, email, phone, message, status, contact_method, social_contact, assigned_to, first_contacted_at, closed_at, created_at, updated_at)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
                c
            );
        }
        console.log("✅ 50 contacts seeded");
    } catch (err) {
        console.error("❌ Contacts seed error:", err.message);
    }
};

run();