import db from "../config/db.js";

export const authorize = (permissionName) => {
    return async (req, res, next) => {
        const user = req.user;

        const result = await db.query(
            `
      SELECT p.name FROM permissions p
      JOIN role_permissions rp ON rp.permission_id = p.id
      WHERE rp.role_id = $1
      `,
            [user.role_id]
        );

        const permissions = result.rows.map((p) => p.name);

        if (!permissions.includes(permissionName)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        next();
    };
};