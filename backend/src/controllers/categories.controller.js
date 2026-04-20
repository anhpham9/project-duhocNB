import db from "../config/db.js";
import { logError, logInfo, auditLog } from "../utils/logger.js";
import { InputSanitizer } from "../utils/sanitizer.js";
import { SecurityLogger } from "../utils/securityLogger.js";

// Roles that can manage categories: superadmin, admin, manager
const MANAGE_CATEGORIES_ROLES = [1, 2, 3];

// Roles that can view categories: all news roles
const VIEW_CATEGORIES_ROLES = [1, 2, 3, 4];

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view categories
        if (!VIEW_CATEGORIES_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                '/api/categories',
                'GET',
                'categories.view'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Insufficient permissions to view categories." 
            });
        }

        const result = await db.query(`
            SELECT 
                c.*,
                COUNT(n.id) as news_count
            FROM categories c
            LEFT JOIN news n ON c.id = n.category_id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        logError('Get categories failed', error, {
            userId: req.user?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view categories
        if (!VIEW_CATEGORIES_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/categories/${id}`,
                'GET',
                'categories.view'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Insufficient permissions to view categories." 
            });
        }

        const result = await db.query(`
            SELECT 
                c.*,
                COUNT(n.id) as news_count
            FROM categories c
            LEFT JOIN news n ON c.id = n.category_id
            WHERE c.id = $1
            GROUP BY c.id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Category not found" 
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        logError('Get category by ID failed', error, {
            requestedCategoryId: req.params.id,
            requesterId: req.user?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Create new category
export const createCategory = async (req, res) => {
    try {
        // Sanitize input data
        const sanitizedData = InputSanitizer.sanitizeCategoryData(req.body);
        const { name, slug } = sanitizedData;
        
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        logInfo('Category creation attempt', {
            createdBy: currentUserId,
            creatorRole: currentUserRole,
            data: { name, slug }
        });

        // Check if user has permission to create categories
        if (!MANAGE_CATEGORIES_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                '/api/categories',
                'POST',
                'categories.create'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot create categories." 
            });
        }

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        // Generate slug if not provided
        let categorySlug = slug;
        if (!categorySlug) {
            categorySlug = name.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        // Check slug uniqueness
        const slugCheck = await db.query(
            'SELECT id FROM categories WHERE slug = $1', 
            [categorySlug]
        );

        if (slugCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Category slug already exists"
            });
        }

        // Create category
        const result = await db.query(`
            INSERT INTO categories (name, slug)
            VALUES ($1, $2)
            RETURNING *
        `, [name, categorySlug]);

        const newCategory = result.rows[0];

        // Audit log successful category creation
        auditLog('CREATE_CATEGORY', currentUserId, {
            categoryId: newCategory.id,
            categoryName: newCategory.name,
            categorySlug: newCategory.slug
        }, req);

        logInfo('Category created successfully', {
            createdBy: currentUserId,
            categoryId: newCategory.id,
            categoryName: newCategory.name
        });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: newCategory
        });

    } catch (error) {
        logError('Create category failed', error, {
            createdBy: req.user?.id,
            targetData: req.body ? { ...req.body } : {}
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Update category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const sanitizedData = InputSanitizer.sanitizeCategoryData(req.body);
        const { name, slug } = sanitizedData;
        
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to update categories
        if (!MANAGE_CATEGORIES_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/categories/${id}`,
                'PUT',
                'categories.update'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot update categories." 
            });
        }

        // Get the target category
        const categoryResult = await db.query(
            'SELECT * FROM categories WHERE id = $1', 
            [id]
        );

        if (categoryResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const existingCategory = categoryResult.rows[0];

        // Build dynamic update query
        const updateData = {};
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (name !== undefined) {
            updateData.name = name;
            updates.push(`name = $${paramCount}`);
            values.push(name);
            paramCount++;
        }

        if (slug !== undefined) {
            // Check slug uniqueness
            const slugCheck = await db.query(
                'SELECT id FROM categories WHERE slug = $1 AND id != $2', 
                [slug, id]
            );

            if (slugCheck.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Category slug already exists"
                });
            }

            updateData.slug = slug;
            updates.push(`slug = $${paramCount}`);
            values.push(slug);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields to update"
            });
        }

        values.push(id);

        // Execute update
        const updateQuery = `
            UPDATE categories 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await db.query(updateQuery, values);
        const updatedCategory = result.rows[0];

        // Audit log successful category update
        auditLog('UPDATE_CATEGORY', currentUserId, {
            categoryId: id,
            categoryName: updatedCategory.name,
            updatedFields: Object.keys(updateData)
        }, req);

        logInfo('Category updated successfully', {
            updatedBy: currentUserId,
            categoryId: id,
            updatedFields: Object.keys(updateData)
        });

        res.json({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory
        });

    } catch (error) {
        logError('Update category failed', error, {
            updatedBy: req.user?.id,
            categoryId: req.params?.id,
            updateData: req.body
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to delete categories
        if (!MANAGE_CATEGORIES_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/categories/${id}`,
                'DELETE',
                'categories.delete'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot delete categories." 
            });
        }

        // Get the target category
        const categoryResult = await db.query(
            'SELECT * FROM categories WHERE id = $1', 
            [id]
        );

        if (categoryResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const targetCategory = categoryResult.rows[0];

        // Check if category has news
        const newsCount = await db.query(
            'SELECT COUNT(*) as count FROM news WHERE category_id = $1',
            [id]
        );

        if (parseInt(newsCount.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete category with existing news. Please move or delete the news first."
            });
        }

        // Delete category
        await db.query('DELETE FROM categories WHERE id = $1', [id]);

        // Audit log successful category deletion
        auditLog('DELETE_CATEGORY', currentUserId, {
            categoryId: id,
            categoryName: targetCategory.name,
            categorySlug: targetCategory.slug
        }, req);

        logInfo('Category deleted successfully', {
            deletedBy: currentUserId,
            categoryId: id,
            categoryName: targetCategory.name
        });

        res.json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {
        logError('Delete category failed', error, {
            deletedBy: req.user?.id,
            categoryId: req.params?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};