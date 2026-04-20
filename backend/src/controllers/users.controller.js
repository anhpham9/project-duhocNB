import bcrypt from "bcrypt";
import db from "../config/db.js";

// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
    1: [1, 2, 3, 4, 5], // Superadmin: can manage all roles
    2: [3, 4, 5],       // Admin: can manage Manager, Editor, Consultant  
    3: [4, 5],          // Manager: can manage Editor, Consultant
    4: [],              // Editor: cannot manage users
    5: []               // Consultant: cannot manage users
};

// Get all users with role information
export const getUsers = async (req, res) => {
    try {
        const currentUserRole = req.user.role_id;

        // Check if user has permission to view users
        if (![1, 2, 3].includes(currentUserRole)) {
            return res.status(403).json({ 
                message: "Access denied. Insufficient permissions." 
            });
        }

        // Get users with role names
        const result = await db.query(`
            SELECT 
                u.id,
                u.name,
                u.username,
                u.email,
                u.phone,
                u.role_id,
                r.name as role_name,
                COALESCE(u.is_active, true) as is_active,
                u.created_at,
                u.updated_at
            FROM users u
            JOIN roles r ON u.role_id = r.id
            ORDER BY u.created_at DESC
        `);

        // Filter users based on current user's permissions
        const allowedRoleIds = ROLE_HIERARCHY[currentUserRole] || [];
        const filteredUsers = result.rows.filter(user => 
            currentUserRole === 1 || // Superadmin sees all
            allowedRoleIds.includes(user.role_id) ||
            user.id === req.user.id // Always show own profile
        );

        res.json({
            success: true,
            data: filteredUsers,
            total: filteredUsers.length
        });

    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Get single user by ID
export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;

        // Check if user has permission to view users
        if (![1, 2, 3].includes(currentUserRole)) {
            return res.status(403).json({ 
                message: "Access denied. Insufficient permissions." 
            });
        }

        const result = await db.query(`
            SELECT 
                u.id,
                u.name,
                u.username,
                u.email,
                u.role_id,
                r.name as role_name,
                COALESCE(u.is_active, true) as is_active,
                u.created_at,
                u.updated_at
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        const user = result.rows[0];

        // Check if current user can view this specific user
        const allowedRoleIds = ROLE_HIERARCHY[currentUserRole] || [];
        if (currentUserRole !== 1 && // Not superadmin
            !allowedRoleIds.includes(user.role_id) &&
            user.id !== req.user.id) { // Not own profile
            return res.status(403).json({ 
                message: "Access denied. Cannot view this user." 
            });
        }

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Create new user
export const createUser = async (req, res) => {
    try {
        const { name, username, email, phone, password, role_id, is_active = true } = req.body;
        const currentUserRole = req.user.role_id;

        // Validate required fields
        if (!name || !username || !email || !password || !role_id) {
            return res.status(400).json({
                success: false,
                message: "All fields are required (name, username, email, password, role_id)"
            });
        }

        // Validate is_active
        if (is_active !== undefined && typeof is_active !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: "is_active must be true or false"
            });
        }

        // Check if current user can create users
        if (![1, 2, 3].includes(currentUserRole)) {
            return res.status(403).json({ 
                message: "Access denied. You cannot create users." 
            });
        }

        // Check if current user can assign this role
        const allowedRoleIds = ROLE_HIERARCHY[currentUserRole] || [];
        if (currentUserRole !== 1 && !allowedRoleIds.includes(role_id)) {
            return res.status(403).json({ 
                message: `Access denied. You cannot create users with role ID ${role_id}.` 
            });
        }

        // Validate role exists
        const roleCheck = await db.query(
            'SELECT id, name FROM roles WHERE id = $1', 
            [role_id]
        );

        if (roleCheck.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid role_id"
            });
        }

        // Check if username already exists
        const usernameCheck = await db.query(
            'SELECT id FROM users WHERE username = $1', 
            [username]
        );

        if (usernameCheck.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }

        // Check if email already exists
        const emailCheck = await db.query(
            'SELECT id FROM users WHERE email = $1', 
            [email]
        );

        if (emailCheck.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Check if phone already exists (if provided)
        if (phone && phone.trim()) {
            const phoneCheck = await db.query(
                'SELECT id FROM users WHERE phone = $1', 
                [phone.trim()]
            );

            if (phoneCheck.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Phone already exists"
                });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await db.query(`
            INSERT INTO users (name, username, email, phone, password, role_id, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, name, username, email, phone, role_id, COALESCE(is_active, true) as is_active, created_at
        `, [name, username, email, phone || null, hashedPassword, role_id, is_active]);

        const newUser = result.rows[0];

        // Get role name
        const roleInfo = roleCheck.rows[0];

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                ...newUser,
                role_name: roleInfo.name
            }
        });

    } catch (error) {
        console.error("Create user error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, username, email, phone, role_id, is_active } = req.body;
        const currentUserRole = req.user.role_id;

        // Validate is_active if provided
        if (is_active !== undefined && typeof is_active !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: "is_active must be true or false"
            });
        }

        // Check if current user can update users
        if (![1, 2, 3].includes(currentUserRole)) {
            return res.status(403).json({ 
                message: "Access denied. You cannot update users." 
            });
        }

        // Get the target user
        const userResult = await db.query(
            'SELECT * FROM users WHERE id = $1', 
            [id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const targetUser = userResult.rows[0];

        // Check if current user can modify this user's current role
        const allowedRoleIds = ROLE_HIERARCHY[currentUserRole] || [];
        if (currentUserRole !== 1 && // Not superadmin
            !allowedRoleIds.includes(targetUser.role_id) &&
            targetUser.id !== req.user.id) { // Not own profile
            return res.status(403).json({ 
                message: "Access denied. You cannot modify this user." 
            });
        }

        // If updating role, check if current user can assign new role
        if (role_id && role_id !== targetUser.role_id) {
            if (currentUserRole !== 1 && !allowedRoleIds.includes(role_id)) {
                return res.status(403).json({ 
                    message: `Access denied. You cannot assign role ID ${role_id}.` 
                });
            }

            // Validate new role exists
            const roleCheck = await db.query(
                'SELECT id FROM roles WHERE id = $1', 
                [role_id]
            );

            if (roleCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role_id"
                });
            }
        }

        // Build update fields
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (name) {
            updates.push(`name = $${paramCount++}`);
            values.push(name);
        }

        if (username && username !== targetUser.username) {
            // Check if new username is available
            const usernameCheck = await db.query(
                'SELECT id FROM users WHERE username = $1 AND id != $2', 
                [username, id]
            );

            if (usernameCheck.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Username already exists"
                });
            }

            updates.push(`username = $${paramCount++}`);
            values.push(username);
        }

        if (email && email !== targetUser.email) {
            // Check if new email is available
            const emailCheck = await db.query(
                'SELECT id FROM users WHERE email = $1 AND id != $2', 
                [email, id]
            );

            if (emailCheck.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists"
                });
            }

            updates.push(`email = $${paramCount++}`);
            values.push(email);
        }

        if (phone !== undefined && phone !== targetUser.phone) {
            // Handle phone update (can be null/empty or a value)
            const trimmedPhone = phone ? phone.trim() : null;
            
            if (trimmedPhone) {
                // Check if new phone is available
                const phoneCheck = await db.query(
                    'SELECT id FROM users WHERE phone = $1 AND id != $2', 
                    [trimmedPhone, id]
                );

                if (phoneCheck.rows.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message: "Phone already exists"
                    });
                }
            }

            updates.push(`phone = $${paramCount++}`);
            values.push(trimmedPhone);
        }

        if (role_id) {
            updates.push(`role_id = $${paramCount++}`);
            values.push(role_id);
        }

        if (is_active !== undefined) {
            updates.push(`is_active = $${paramCount++}`);
            values.push(is_active);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields to update"
            });
        }

        // Add updated_at
        updates.push(`updated_at = NOW()`);
        values.push(id);

        // Execute update
        const updateQuery = `
            UPDATE users 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id, name, username, email, phone, role_id, COALESCE(is_active, true) as is_active, updated_at
        `;

        const result = await db.query(updateQuery, values);
        const updatedUser = result.rows[0];

        // Get role name
        const roleResult = await db.query(
            'SELECT name FROM roles WHERE id = $1', 
            [updatedUser.role_id]
        );

        res.json({
            success: true,
            message: "User updated successfully",
            data: {
                ...updatedUser,
                role_name: roleResult.rows[0].name
            }
        });

    } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;

        // Check if current user can delete users
        if (![1, 2, 3].includes(currentUserRole)) {
            return res.status(403).json({ 
                message: "Access denied. You cannot delete users." 
            });
        }

        // Get the target user
        const userResult = await db.query(
            'SELECT * FROM users WHERE id = $1', 
            [id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const targetUser = userResult.rows[0];

        // Prevent self-deletion
        if (targetUser.id === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete your own account"
            });
        }

        // Check if current user can delete this user's role
        const allowedRoleIds = ROLE_HIERARCHY[currentUserRole] || [];
        if (currentUserRole !== 1 && !allowedRoleIds.includes(targetUser.role_id)) {
            return res.status(403).json({ 
                message: "Access denied. You cannot delete this user." 
            });
        }

        // Delete user
        await db.query('DELETE FROM users WHERE id = $1', [id]);

        res.json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Get available roles for current user to assign
export const getAvailableRoles = async (req, res) => {
    try {
        const currentUserRole = req.user.role_id;

        // Check if current user can create users
        if (![1, 2, 3].includes(currentUserRole)) {
            return res.status(403).json({ 
                message: "Access denied. You cannot view assignable roles." 
            });
        }

        const allowedRoleIds = ROLE_HIERARCHY[currentUserRole] || [];

        // Get all roles
        const result = await db.query(`
            SELECT id, name, description 
            FROM roles 
            ORDER BY id ASC
        `);

        // Filter roles based on permissions
        const availableRoles = result.rows.filter(role => 
            currentUserRole === 1 || allowedRoleIds.includes(role.id)
        );

        res.json({
            success: true,
            data: availableRoles
        });

    } catch (error) {
        console.error("Get available roles error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Reset user password  
export const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;

        // Check if current user can reset passwords
        if (![1, 2, 3].includes(currentUserRole)) {
            return res.status(403).json({ 
                message: "Access denied. You cannot reset passwords." 
            });
        }

        // Get the target user
        const userResult = await db.query(
            'SELECT * FROM users WHERE id = $1', 
            [id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const targetUser = userResult.rows[0];

        // Permission check based on role hierarchy
        const allowedRoleIds = ROLE_HIERARCHY[currentUserRole] || [];
        
        // Superadmin can reset all passwords (including other superadmins)
        // Other roles can only reset passwords for lower roles
        if (currentUserRole !== 1 && !allowedRoleIds.includes(targetUser.role_id)) {
            return res.status(403).json({ 
                message: "Access denied. You cannot reset this user's password." 
            });
        }

        // Generate a random secure password
        const generateRandomPassword = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
            let password = '';
            for (let i = 0; i < 12; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return password;
        };

        const newPassword = generateRandomPassword();
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password in database
        await db.query(
            'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', 
            [hashedPassword, id]
        );

        res.json({
            success: true,
            message: "Password reset successfully",
            data: {
                newPassword: newPassword,
                user: {
                    id: targetUser.id,
                    name: targetUser.name,
                    username: targetUser.username
                }
            }
        });

    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};