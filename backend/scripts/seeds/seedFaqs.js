import db from "../../src/config/db.js";

const run = async () => {
    try {
        // Lấy 5 trường để seed FAQ loại school
        const schools = await db.query(`SELECT id FROM schools LIMIT 5`);
        const schoolIds = schools.rows.map(s => s.id);
        const faqs = [];
        // 10 FAQ chung
        for (let i = 1; i <= 10; i++) {
            faqs.push([
                `Câu hỏi chung số ${i}?`,
                `Đây là câu trả lời cho câu hỏi chung số ${i}.`,
                'general',
                null
            ]);
        }
        // 10 FAQ cho trường
        for (let i = 1; i <= 10; i++) {
            faqs.push([
                `Câu hỏi về trường số ${i}?`,
                `Đây là câu trả lời cho câu hỏi về trường số ${i}.`,
                'school',
                schoolIds[i % schoolIds.length] || null
            ]);
        }
        for (const f of faqs) {
            await db.query(
                `INSERT INTO faqs (question, answer, type, school_id)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT DO NOTHING`,
                f
            );
        }
        console.log("✅ 20 faqs seeded");
    } catch (err) {
        console.error("❌ Faqs seed error:", err.message);
    }
};

run();
