
import db from "../../src/config/db.js";

const regions = [
  { name: "Tokyo", slug: "tokyo" },
  { name: "Osaka", slug: "osaka" },
  { name: "Kyoto", slug: "kyoto" },
  { name: "Yokohama", slug: "yokohama" },
  { name: "Kobe", slug: "kobe" },
  { name: "Nagoya", slug: "nagoya" },
  { name: "Fukuoka", slug: "fukuoka" },
  { name: "Sendai", slug: "sendai" },
  { name: "Sapporo", slug: "sapporo" },
  { name: "Hiroshima", slug: "hiroshima" },
];

const run = async () => {
  try {
    for (const region of regions) {
      await db.query(
        `INSERT INTO regions (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING`,
        [region.name, region.slug]
      );
    }
    console.log("✅ Regions seeded");
  } catch (err) {
    console.error("❌ Regions seed error:", err.message);
  }
};

run();