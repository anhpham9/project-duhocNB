import jwt from "jsonwebtoken";

const SECRET = "mysecret"; // sau chuyển .env

export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            role_id: user.role_id,
        },
        SECRET,
        { expiresIn: "1d" }
    );
};

export const verifyToken = (token) => {
    return jwt.verify(token, SECRET);
};