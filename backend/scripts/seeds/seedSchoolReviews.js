
import db from "../../src/config/db.js";
import faker from "faker";

const nationalities = [
  'Việt Nam', 'Nhật Bản', 'Hàn Quốc', 'Trung Quốc', 'Mỹ', 'Úc', 'Anh', 'Pháp', 'Đức', 'Thái Lan'
];

const run = async () => {
  try {
    const res = await db.query('SELECT id FROM schools');
    const schoolIds = res.rows.map(row => row.id);
    if (schoolIds.length === 0) {
      console.log('No schools found. Please seed schools first.');
      return;
    }

    let total = 0;
    for (const schoolId of schoolIds) {
      const numReviews = faker.datatype.number({ min: 2, max: 4 });
      for (let i = 0; i < numReviews; i++) {
        const studentName = faker.name.findName();
        const avatarUrl = faker.image.avatar();
        const nationality = faker.random.arrayElement(nationalities);
        const coursePeriod = `${faker.datatype.number({ min: 2021, max: 2026 })}-${faker.datatype.number({ min: 2027, max: 2030 })}`;
        const rating = faker.datatype.number({ min: 3, max: 5 });
        const content = faker.lorem.paragraphs(2);
        await db.query(
          `INSERT INTO school_reviews (school_id, student_name, avatar_url, nationality, course_period, rating, content)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [schoolId, studentName, avatarUrl, nationality, coursePeriod, rating, content]
        );
        total++;
      }
    }
    console.log(`✅ Seeded ${total} school reviews.`);
  } catch (err) {
    console.error('❌ Error seeding school_reviews:', err.message);
  }
};

run();
