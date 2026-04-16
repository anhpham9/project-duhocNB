// scripts/createAdmin.js
import bcrypt from "bcrypt";
import db from "../src/config/db.js";

const run = async () => {
    try {
        const hash = await bcrypt.hash("123456", 10);

        await db.query(
            `
      INSERT INTO users 
      (name, username, email, phone, password, role_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (username) DO NOTHING
      `,
            [
                "Super Admin",          // name
                "superadmin",                // username
                "superadmin@example.com",    // email
                null,                   // phone (có thể null)
                hash,                   // password đã hash
                1                       // role_id (phải tồn tại trong roles)
            ]
        );

        console.log("✅ Admin created");
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
};

run();