import { verifyToken } from "../utils/jwt.js";

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "No token" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const user = verifyToken(token);
        req.user = user;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};