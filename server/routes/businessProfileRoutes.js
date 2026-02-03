import express from 'express';
import protect from '../middleware/authMiddleware.js';
import {
    createBusinessProfile,
    getBusinessProfile,
    updateBusinessProfile,
    checkProfileCompletion,
    deleteBusinessProfile
} from '../controllers/businessProfileController.js';

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// Business profile routes
router.route('/')
    .post(createBusinessProfile)
    .get(getBusinessProfile)
    .put(updateBusinessProfile)
    .delete(deleteBusinessProfile);

router.get('/check', checkProfileCompletion);

export default router;
