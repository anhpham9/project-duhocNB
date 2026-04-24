// backend/scripts/seeds/clearAllSeededData.js
// Script to delete all seeded data from all tables (for reseeding)
// Usage: node backend/scripts/seeds/clearAllSeededData.js

import db from "../../src/config/db.js";

const tables = [
  "school_reviews",
  "news_view_stats",
  "news",
  "contact_notes",
  "contacts",
  "faqs",
  "schools",
  "regions",
  "school_types",
  "static_pages",
  "settings",
  "notification_settings",
  "notifications",
  "users",
  "roles"
];

const run = async () => {
  try {
    // Disable foreign key checks (Postgres: use CASCADE or TRUNCATE ... CASCADE)
    for (const table of tables) {
      await db.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
      console.log(`✅ Cleared table: ${table}`);
    }
    console.log("\nAll seeded data cleared. You can now reseed safely.");
  } catch (err) {
    console.error("❌ Error clearing tables:", err.message);
  }
};

run();
