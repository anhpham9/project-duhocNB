
import db from "../../src/config/db.js";

const schoolTypes = [
  { name: "Language School", slug: "language-school" },
  { name: "Integrated School", slug: "integrated-school" },
];

const run = async () => {
  try {
    for (const schoolType of schoolTypes) {
      await db.query(
        `INSERT INTO school_types (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING`,
        [schoolType.name, schoolType.slug]
      );
    }
    console.log("✅ School types seeded");
  } catch (err) {
    console.error("❌ School types seed error:", err.message);
  }
};

run();