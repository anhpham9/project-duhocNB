import express from 'express';
import multer from 'multer';
import { 
    getSchoolReviews,
    getSchoolReviewById,
    createSchoolReview,
    updateSchoolReview,
    deleteSchoolReview,
    uploadSchoolReviewAvatar,
    deleteSchoolReviewAvatar
} from '../controllers/schoolReviews.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();
const maxSchoolReviewImageSize = Number(process.env.CLOUDINARY_MAX_FILE_SIZE || 1 * 1024 * 1024);
const schoolReviewImageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: Number.isFinite(maxSchoolReviewImageSize) && maxSchoolReviewImageSize > 0 ? maxSchoolReviewImageSize : 1 * 1024 * 1024
    }
});

// All routes require authentication
router.use(authenticate);

// Apply rate limiting
router.use(rateLimiter.schoolReviewsLimiter);

// School reviews routes
router.get('/', getSchoolReviews);               // GET /api/school-reviews
router.post('/upload-avatar', rateLimiter.uploadLimiter, schoolReviewImageUpload.single('image'), uploadSchoolReviewAvatar); // POST /api/school-reviews/upload-avatar
router.delete('/upload-avatar', deleteSchoolReviewAvatar); // DELETE /api/school-reviews/upload-avatar
router.get('/:id', getSchoolReviewById);         // GET /api/school-reviews/:id
router.post('/', createSchoolReview);            // POST /api/school-reviews
router.put('/:id', updateSchoolReview);          // PUT /api/school-reviews/:id
router.delete('/:id', deleteSchoolReview);       // DELETE /api/school-reviews/:id

export default router;