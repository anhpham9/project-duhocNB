import db from "../../src/config/db.js";

const run = async () => {
    try {
        // Lấy 5 category và 10 author mẫu (nếu có)
        const categories = await db.query(`SELECT id FROM categories LIMIT 5`);
        const users = await db.query(`SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name IN ('superadmin','admin','manager','editor') LIMIT 10`);
        const categoryIds = categories.rows.map(c => c.id);
        const authorIds = users.rows.map(u => u.id);

        if (categoryIds.length === 0 || authorIds.length === 0) {
            console.log("❌ Cần seed categories và users trước!");
            return;
        }

        const newsList = [];
        for (let i = 1; i <= 20; i++) {
            const catId = categoryIds[i % categoryIds.length];
            const authorId = authorIds[i % authorIds.length];
            newsList.push([
                `Sample News Title ${i}`,
                `sample-news-title-${i}`,
                `Nội dung mẫu cho tin tức số ${i}. Đây là nội dung mô tả chi tiết cho tin tức này.`,
                `Tóm tắt tin tức số ${i}.`,
                null, // thumbnail_url
                catId,
                authorId,
                i % 3 === 0 ? 'archived' : (i % 2 === 0 ? 'published' : 'draft'),
                new Date(),
                `Meta title cho news ${i}`,
                `Meta description cho news ${i}`
            ]);
        }

        for (const n of newsList) {
            await db.query(
                `INSERT INTO news (title, slug, content, excerpt, thumbnail_url, category_id, author_id, status, published_at, meta_title, meta_description)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
                 ON CONFLICT (slug, category_id) DO NOTHING`,
                n
            );
        }

        console.log("✅ 20 news seeded");
    } catch (err) {
        console.error("❌ News seed error:", err.message);
    }
};

run();