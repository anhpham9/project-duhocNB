// src/services/auth.service.js
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import db from "../config/db.js";

export const loginService = async (username, password) => {
    const user = await db.query(
        "SELECT * FROM users WHERE username = $1 AND is_active = true",
        [username]
    );

    if (user.rows.length === 0) {
        throw new Error("User not found");
    }

    const foundUser = user.rows[0];

    const isMatch = await bcrypt.compare(password, foundUser.password);

    if (!isMatch) {
        throw new Error("Invalid password");
    }

    const token = generateToken({
        id: foundUser.id,
        role_id: foundUser.role_id,
    });

    return { token };
};