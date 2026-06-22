import db from "../config/db.js";
import { logError, logInfo, auditLog } from "../utils/logger.js";
import { InputSanitizer } from "../utils/sanitizer.js";
import { SecurityLogger } from "../utils/securityLogger.js";
import {
    MEDIA_OWNER_TYPES,
    MEDIA_FIELD_NAMES,
    getSchoolReviewOwnerKey,
    syncMediaAssetOwnership,
    getMediaAssetRefsByOwner,
    deleteMediaAssetRef
} from "../services/mediaAsset.service.js";
import {
    DEFAULT_IMAGE_MIME_TYPES,
    validateImageUploadFile,
    uploadImageToCloudinary,
    deleteCloudinaryAssetByPublicId,
    deleteCloudinaryAssetsSafely,
    ensureCloudinaryReady,
    CMS_DEFAULT_MAX_FILE_SIZE
} from "../services/cmsAsset.service.js";

// Roles that can manage school reviews: superadmin, admin, manager
const MANAGE_REVIEWS_ROLES = [1, 2, 3];
const ALLOWED_REVIEW_IMAGE_TYPES = new Set(["avatar"]);
const ALLOWED_IMAGE_MIME_TYPES = DEFAULT_IMAGE_MIME_TYPES;
const DEFAULT_REVIEW_IMAGE_MAX_FILE_SIZE = CMS_DEFAULT_MAX_FILE_SIZE;
const configuredReviewImageMaxFileSize = Number(process.env.CLOUDINARY_MAX_FILE_SIZE || CMS_DEFAULT_MAX_FILE_SIZE);
const REVIEW_IMAGE_MAX_FILE_SIZE = Number.isFinite(configuredReviewImageMaxFileSize) && configuredReviewImageMaxFileSize > 0
    ? configuredReviewImageMaxFileSize
    : DEFAULT_REVIEW_IMAGE_MAX_FILE_SIZE;

export const uploadSchoolReviewAvatar = async (req, res) => {
    const currentUserRole = req.user?.role_id;
    const currentUserId = req.user?.id;

    try {
        if (!MANAGE_REVIEWS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                "/api/school-reviews/upload-avatar",
                "POST",
                "school_reviews.upload"
            );

            return res.status(403).json({
                success: false,
                message: "Access denied. You cannot upload school review avatars."
            });
        }

        ensureCloudinaryReady();

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image file"
            });
        }

        const imageTypeRaw = String(req.body?.type || "avatar").trim().toLowerCase();
        const imageType = ALLOWED_REVIEW_IMAGE_TYPES.has(imageTypeRaw) ? imageTypeRaw : "avatar";

        validateImageUploadFile({
            file: req.file,
            allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
            maxFileSize: REVIEW_IMAGE_MAX_FILE_SIZE,
            imageLabel: imageType
        });

        const folderRoot = String(process.env.CLOUDINARY_FOLDER || "duhocNB").trim() || "duhocNB";

        const uploadResult = await uploadImageToCloudinary({
            file: req.file,
            folder: `${folderRoot}/school-reviews/${imageType}`,
            transformation: [{ quality: "auto", fetch_format: "auto" }]
        });

        return res.json({
            success: true,
            message: "Upload image success",
            data: {
                imageType,
                url: uploadResult.url,
                publicId: uploadResult.publicId,
                width: uploadResult.width,
                height: uploadResult.height,
                bytes: uploadResult.bytes,
                format: uploadResult.format
            }
        });
    } catch (error) {
        const isValidationError = String(error?.message || "").toLowerCase().includes("invalid")
            || String(error?.message || "").toLowerCase().includes("exceeds")
            || String(error?.message || "").toLowerCase().includes("please select");

        logError("Upload school review avatar failed", error, {
            requesterId: currentUserId,
            imageType: req.body?.type
        });

        return res.status(isValidationError ? 400 : 500).json({
            success: false,
            message: error?.message || "Upload image failed"
        });
    }
};

export const deleteSchoolReviewAvatar = async (req, res) => {
    const currentUserRole = req.user?.role_id;
    const currentUserId = req.user?.id;

    try {
        if (!MANAGE_REVIEWS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                "/api/school-reviews/upload-avatar",
                "DELETE",
                "school_reviews.upload.delete"
            );

            return res.status(403).json({
                success: false,
                message: "Access denied. You cannot delete uploaded review avatars."
            });
        }

        const publicId = String(req.body?.publicId || "").trim();
        if (!publicId) {
            return res.status(400).json({
                success: false,
                message: "publicId is required"
            });
        }

        ensureCloudinaryReady();
        await deleteCloudinaryAssetByPublicId(publicId);

        return res.json({
            success: true,
            message: "Deleted uploaded image"
        });
    } catch (error) {
        logError("Delete school review avatar failed", error, {
            requesterId: currentUserId
        });

        return res.status(500).json({
            success: false,
            message: error?.message || "Delete image failed"
        });
    }
};

// Get all school reviews
export const getSchoolReviews = async (req, res) => {
    try {
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view school reviews
        if (!MANAGE_REVIEWS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                '/api/school-reviews',
                'GET',
                'school_reviews.view'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Insufficient permissions to view school reviews." 
            });
        }

        const { school_id, rating, nationality } = req.query;
        let query = `
            SELECT 
                sr.*,
                s.name as school_name
            FROM school_reviews sr
            LEFT JOIN schools s ON sr.school_id = s.id
        `;
        
        const conditions = [];
        const values = [];
        let paramCount = 1;

        // Filter by school
        if (school_id) {
            conditions.push(`sr.school_id = $${paramCount}`);
            values.push(parseInt(school_id));
            paramCount++;
        }

        // Filter by rating
        if (rating) {
            conditions.push(`sr.rating = $${paramCount}`);
            values.push(parseInt(rating));
            paramCount++;
        }

        // Filter by nationality
        if (nationality) {
            conditions.push(`sr.nationality ILIKE $${paramCount}`);
            values.push(`%${nationality}%`);
            paramCount++;
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY sr.created_at DESC`;

        const result = await db.query(query, values);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        logError('Get school reviews failed', error, {
            userId: req.user?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Get school review by ID
export const getSchoolReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to view school reviews
        if (!MANAGE_REVIEWS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/school-reviews/${id}`,
                'GET',
                'school_reviews.view'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Insufficient permissions to view school reviews." 
            });
        }

        const result = await db.query(`
            SELECT 
                sr.*,
                s.name as school_name
            FROM school_reviews sr
            LEFT JOIN schools s ON sr.school_id = s.id
            WHERE sr.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "School review not found" 
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        logError('Get school review by ID failed', error, {
            requestedReviewId: req.params.id,
            requesterId: req.user?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Create new school review
export const createSchoolReview = async (req, res) => {
    try {
        // Sanitize input data
        const sanitizedData = InputSanitizer.sanitizeSchoolReviewData(req.body);
        const { 
            school_id,
            student_name,
            avatar_url,
            nationality,
            course_period,
            rating,
            content
        } = sanitizedData;
        const incomingAssetPublicIds = {
            [MEDIA_FIELD_NAMES.schoolReviewAvatarUrl]: String(req.body?.avatarAssetPublicId || "").trim()
        };
        
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        logInfo('School review creation attempt', {
            createdBy: currentUserId,
            creatorRole: currentUserRole,
            data: { school_id, student_name, rating }
        });

        // Check if user has permission to create school reviews
        if (!MANAGE_REVIEWS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                '/api/school-reviews',
                'POST',
                'school_reviews.create'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot create school reviews." 
            });
        }

        // Validate required fields
        if (!school_id || !student_name || !rating) {
            return res.status(400).json({
                success: false,
                message: "School ID, student name, and rating are required"
            });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        // Validate school exists
        const schoolCheck = await db.query(
            'SELECT id FROM schools WHERE id = $1', 
            [school_id]
        );

        if (schoolCheck.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid school ID"
            });
        }

        // Create school review
        const result = await db.query(`
            INSERT INTO school_reviews (
                school_id, student_name, avatar_url, nationality, 
                course_period, rating, content
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            school_id,
            student_name,
            avatar_url || null,
            nationality || null,
            course_period || null,
            rating,
            content || null
        ]);

        const newReview = result.rows[0];

        const reviewOwnerKey = getSchoolReviewOwnerKey(newReview.id);
        const ownershipSyncResult = await syncMediaAssetOwnership({
            ownerType: MEDIA_OWNER_TYPES.schoolReviews,
            ownerKey: reviewOwnerKey,
            fieldMappings: [
                {
                    fieldName: MEDIA_FIELD_NAMES.schoolReviewAvatarUrl,
                    payloadKey: "avatar_url"
                }
            ],
            payload: newReview,
            incomingAssetPublicIds,
            userId: currentUserId,
            client: db
        });

        await deleteCloudinaryAssetsSafely(ownershipSyncResult.publicIdsToDelete, logError, {
            requesterId: currentUserId,
            reviewId: newReview.id
        });

        // Update school rating and review count
        await updateSchoolRating(school_id);

        // Audit log successful school review creation
        auditLog('CREATE_SCHOOL_REVIEW', currentUserId, {
            reviewId: newReview.id,
            schoolId: newReview.school_id,
            rating: newReview.rating,
            studentName: newReview.student_name
        }, req);

        logInfo('School review created successfully', {
            createdBy: currentUserId,
            reviewId: newReview.id,
            schoolId: newReview.school_id,
            rating: newReview.rating
        });

        res.status(201).json({
            success: true,
            message: "School review created successfully",
            data: newReview
        });

    } catch (error) {
        logError('Create school review failed', error, {
            createdBy: req.user?.id,
            targetData: req.body ? { ...req.body } : {}
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Update school review
export const updateSchoolReview = async (req, res) => {
    try {
        const { id } = req.params;
        const sanitizedData = InputSanitizer.sanitizeSchoolReviewData(req.body);
        const { 
            student_name,
            avatar_url,
            nationality,
            course_period,
            rating,
            content
        } = sanitizedData;
        const incomingAssetPublicIds = {
            [MEDIA_FIELD_NAMES.schoolReviewAvatarUrl]: String(req.body?.avatarAssetPublicId || "").trim()
        };
        
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to update school reviews
        if (!MANAGE_REVIEWS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/school-reviews/${id}`,
                'PUT',
                'school_reviews.update'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot update school reviews." 
            });
        }

        // Get the target review
        const reviewResult = await db.query(
            'SELECT * FROM school_reviews WHERE id = $1', 
            [id]
        );

        if (reviewResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "School review not found"
            });
        }

        const existingReview = reviewResult.rows[0];

        // Build dynamic update query
        const updateData = {};
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (student_name !== undefined) {
            updateData.student_name = student_name;
            updates.push(`student_name = $${paramCount}`);
            values.push(student_name);
            paramCount++;
        }

        if (avatar_url !== undefined) {
            updateData.avatar_url = avatar_url;
            updates.push(`avatar_url = $${paramCount}`);
            values.push(avatar_url || null);
            paramCount++;
        }

        if (nationality !== undefined) {
            updateData.nationality = nationality;
            updates.push(`nationality = $${paramCount}`);
            values.push(nationality || null);
            paramCount++;
        }

        if (course_period !== undefined) {
            updateData.course_period = course_period;
            updates.push(`course_period = $${paramCount}`);
            values.push(course_period || null);
            paramCount++;
        }

        if (rating !== undefined) {
            // Validate rating range
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: "Rating must be between 1 and 5"
                });
            }
            updateData.rating = rating;
            updates.push(`rating = $${paramCount}`);
            values.push(rating);
            paramCount++;
        }

        if (content !== undefined) {
            updateData.content = content;
            updates.push(`content = $${paramCount}`);
            values.push(content || null);
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
            UPDATE school_reviews 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await db.query(updateQuery, values);
        const updatedReview = result.rows[0];

        const reviewOwnerKey = getSchoolReviewOwnerKey(updatedReview.id);
        const ownershipSyncResult = await syncMediaAssetOwnership({
            ownerType: MEDIA_OWNER_TYPES.schoolReviews,
            ownerKey: reviewOwnerKey,
            fieldMappings: [
                {
                    fieldName: MEDIA_FIELD_NAMES.schoolReviewAvatarUrl,
                    payloadKey: "avatar_url"
                }
            ],
            payload: updatedReview,
            incomingAssetPublicIds,
            userId: currentUserId,
            client: db
        });

        await deleteCloudinaryAssetsSafely(ownershipSyncResult.publicIdsToDelete, logError, {
            requesterId: currentUserId,
            reviewId: updatedReview.id
        });

        // Update school rating if rating changed
        if (rating !== undefined && rating !== existingReview.rating) {
            await updateSchoolRating(existingReview.school_id);
        }

        // Audit log successful review update
        auditLog('UPDATE_SCHOOL_REVIEW', currentUserId, {
            reviewId: id,
            schoolId: updatedReview.school_id,
            updatedFields: Object.keys(updateData)
        }, req);

        logInfo('School review updated successfully', {
            updatedBy: currentUserId,
            reviewId: id,
            updatedFields: Object.keys(updateData)
        });

        res.json({
            success: true,
            message: "School review updated successfully",
            data: updatedReview
        });

    } catch (error) {
        logError('Update school review failed', error, {
            updatedBy: req.user?.id,
            reviewId: req.params?.id,
            updateData: req.body
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Delete school review
export const deleteSchoolReview = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserRole = req.user.role_id;
        const currentUserId = req.user.id;

        // Check if user has permission to delete school reviews
        if (!MANAGE_REVIEWS_ROLES.includes(currentUserRole)) {
            SecurityLogger.logPermissionViolation(
                currentUserId,
                req.ip,
                `/api/school-reviews/${id}`,
                'DELETE',
                'school_reviews.delete'
            );
            
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You cannot delete school reviews." 
            });
        }

        // Get the target review
        const reviewResult = await db.query(
            'SELECT * FROM school_reviews WHERE id = $1', 
            [id]
        );

        if (reviewResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "School review not found"
            });
        }

        const targetReview = reviewResult.rows[0];
        const reviewOwnerKey = getSchoolReviewOwnerKey(targetReview.id);
        const existingAssetRefs = await getMediaAssetRefsByOwner({
            ownerType: MEDIA_OWNER_TYPES.schoolReviews,
            ownerKey: reviewOwnerKey,
            client: db
        });

        // Delete review
        await db.query('DELETE FROM school_reviews WHERE id = $1', [id]);

        const publicIdsToDelete = [];
        for (const assetRef of existingAssetRefs) {
            const deletedAssetRef = await deleteMediaAssetRef({
                ownerType: MEDIA_OWNER_TYPES.schoolReviews,
                ownerKey: reviewOwnerKey,
                fieldName: assetRef.field_name,
                client: db
            });

            if (deletedAssetRef?.public_id) {
                publicIdsToDelete.push(deletedAssetRef.public_id);
            }
        }

        // Update school rating after deletion
        await updateSchoolRating(targetReview.school_id);

        await deleteCloudinaryAssetsSafely(publicIdsToDelete, logError, {
            requesterId: currentUserId,
            reviewId: targetReview.id
        });

        // Audit log successful review deletion
        auditLog('DELETE_SCHOOL_REVIEW', currentUserId, {
            reviewId: id,
            schoolId: targetReview.school_id,
            studentName: targetReview.student_name,
            rating: targetReview.rating
        }, req);

        logInfo('School review deleted successfully', {
            deletedBy: currentUserId,
            reviewId: id,
            schoolId: targetReview.school_id
        });

        res.json({
            success: true,
            message: "School review deleted successfully"
        });

    } catch (error) {
        logError('Delete school review failed', error, {
            deletedBy: req.user?.id,
            reviewId: req.params?.id
        });
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Helper function to update school rating and review count
async function updateSchoolRating(schoolId) {
    try {
        const result = await db.query(`
            SELECT 
                AVG(rating)::DECIMAL(2,1) as avg_rating,
                COUNT(*) as review_count
            FROM school_reviews 
            WHERE school_id = $1
        `, [schoolId]);

        const { avg_rating, review_count } = result.rows[0];

        await db.query(`
            UPDATE schools 
            SET rating = $1, review_count = $2
            WHERE id = $3
        `, [avg_rating || 0, review_count || 0, schoolId]);

        logInfo('School rating updated', {
            schoolId,
            avgRating: avg_rating,
            reviewCount: review_count
        });

    } catch (error) {
        logError('Update school rating failed', error, {
            schoolId
        });
    }
}