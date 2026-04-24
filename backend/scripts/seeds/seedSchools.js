import db from "../../src/config/db.js";

const run = async () => {
    try {
        // Lấy region, type
        const regions = await db.query(`SELECT id FROM regions LIMIT 5`);
        const types = await db.query(`SELECT id FROM school_types LIMIT 2`);
        const regionIds = regions.rows.map(r => r.id);
        const typeIds = types.rows.map(t => t.id);
        if (regionIds.length === 0 || typeIds.length === 0) {
            console.log("❌ Cần seed regions và school_types trước!");
            return;
        }
        const schools = [];
        for (let i = 1; i <= 20; i++) {
            schools.push([
                `Trường Nhật ngữ ${i}`,
                `truong-nhat-ngu-${i}`,
                `Địa chỉ số ${i}, Quận ${i % 5 + 1}, Tokyo`,
                1200000 + i * 10000,
                20 + (i % 10),
                80 + (i % 15),
                JSON.stringify(["Ký túc xá", "Học bổng", "Hỗ trợ việc làm"]),
                regionIds[i % regionIds.length],
                typeIds[i % typeIds.length],
                i % 4 === 0 ? 'partner' : (i % 3 === 0 ? 'active' : (i % 2 === 0 ? 'paused' : 'pending')),
                null,
                null,
                (3.5 + (i % 15) * 0.1).toFixed(1),
                10 + (i % 20),
                new Date(),
                new Date()
            ]);
        }
        for (const s of schools) {
            await db.query(
                `INSERT INTO schools (name, slug, location, tuition_per_year, class_size, visa_success_rate, features, region_id, type_id, status, logo_url, thumbnail_url, rating, review_count, created_at, updated_at)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
                 ON CONFLICT (slug) DO NOTHING`,
                s
            );
        }
        console.log("✅ 20 schools seeded");
    } catch (err) {
        console.error("❌ Schools seed error:", err.message);
    }
};

run();