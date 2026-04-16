import bcrypt from "bcrypt";
import db from "../config/db.js";
import { generateToken } from "../utils/jwt.js";

export const login = async (req, res) => {
    const { username, password } = req.body;

    const result = await db.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
    );

    if (result.rows.length === 0) {
        return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ message: "Wrong password" });
    }

    const token = generateToken(user);

    res.json({ token });
};