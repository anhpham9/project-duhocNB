import db from "../../src/config/db.js";

const run = async () => {
    try {
        // Lấy tất cả news id
        const news = await db.query(`SELECT id FROM news`);
        if (news.rows.length === 0) {
            console.log("❌ Không có bản ghi news nào. Hãy seed news trước!");
            return;
        }
        for (const n of news.rows) {
            await db.query(
                `INSERT INTO news_view_stats (news_id, view_count)
                 VALUES ($1, $2)
                 ON CONFLICT (news_id) DO NOTHING`,
                [n.id, Math.floor(Math.random() * 1000)]
            );
        }
        console.log(`✅ Đã seed view_count cho ${news.rows.length} news.`);
    } catch (err) {
        console.error("❌ NewsViewStats seed error:", err.message);
    }
};

run();
