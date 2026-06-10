import db from "../../src/config/db.js";

const run = async () => {
    try {
        // Lấy contact_id và user_id
        const contacts = await db.query(`SELECT id FROM contacts LIMIT 50`);
        const users = await db.query(`SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name IN ('admin','manager','consultant','editor')`);
        const contactIds = contacts.rows.map(c => c.id);
        const userIds = users.rows.map(u => u.id);
        if (contactIds.length === 0 || userIds.length === 0) {
            console.log("❌ Cần seed contacts và users trước!");
            return;
        }
        let count = 0;
        for (let i = 0; i < contactIds.length; i++) {
            // Mỗi contact có 2-3 notes
            const noteCount = 2 + (i % 2);
            for (let j = 0; j < noteCount; j++) {
                await db.query(
                    `INSERT INTO contact_notes (contact_id, user_id, note, created_at)
                     VALUES ($1, $2, $3, $4)`,
                    [
                        contactIds[i],
                        userIds[(i + j) % userIds.length],
                        `Ghi chú số ${j + 1} cho contact ${contactIds[i]}`,
                        new Date()
                    ]
                );
                count++;
            }
        }
        console.log(`✅ Đã seed ${count} contact_notes.`);
    } catch (err) {
        console.error("❌ ContactNotes seed error:", err.message);
    }
};

run();