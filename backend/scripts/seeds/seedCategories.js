import db from "../../src/config/db.js";

const run = async () => {
    try {
        await db.query(`
            INSERT INTO categories (name, slug) VALUES 
            ('Du học Nhật Bản', 'du-hoc-nhat-ban'),
            ('Nhật Bản', 'nhat-ban'),
            ('Tin tức giáo dục', 'tin-tuc-giao-duc'),
            ('Kinh nghiệm du học', 'kinh-nghiem-du-hoc'),
            ('Tư vấn du học', 'tu-van-du-hoc'),
            ('Blog', 'blog')
            ON CONFLICT (slug) DO NOTHING
        `);

        console.log("✅ Categories seeded");
    } catch (err) {
        console.error("❌ Categories seed error:", err.message);
    }
};

run();