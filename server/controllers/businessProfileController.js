import BusinessProfile from '../models/BusinessProfile.js';
import User from '../models/User.js';

/**
 * @desc    Create business profile for logged-in user
 * @route   POST /api/business-profile
 * @access  Private
 */
export const createBusinessProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check if user already has a business profile
        const existingProfile = await BusinessProfile.findOne({ userId });
        if (existingProfile) {
            return res.status(400).json({
                message: 'Business profile already exists. Use update endpoint to modify.'
            });
        }

        // Create business profile
        const profileData = {
            userId,
            ...req.body
        };

        const businessProfile = await BusinessProfile.create(profileData);

        // Update user's hasCompletedProfile flag and businessProfileId
        await User.findByIdAndUpdate(userId, {
            hasCompletedProfile: true,
            businessProfileId: businessProfile._id
        });

        res.status(201).json({
            message: 'Business profile created successfully',
            businessProfile
        });
    } catch (error) {
        console.error('Error creating business profile:', error);
        res.status(500).json({
            message: 'Failed to create business profile',
            error: error.message
        });
    }
};

/**
 * @desc    Get business profile for logged-in user
 * @route   GET /api/business-profile
 * @access  Private
 */
export const getBusinessProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const businessProfile = await BusinessProfile.findOne({ userId });

        if (!businessProfile) {
            return res.status(404).json({
                message: 'Business profile not found. Please complete your profile setup.'
            });
        }

        res.status(200).json(businessProfile);
    } catch (error) {
        console.error('Error fetching business profile:', error);
        res.status(500).json({
            message: 'Failed to fetch business profile',
            error: error.message
        });
    }
};

/**
 * @desc    Update business profile for logged-in user
 * @route   PUT /api/business-profile
 * @access  Private
 */
export const updateBusinessProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const businessProfile = await BusinessProfile.findOneAndUpdate(
            { userId },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!businessProfile) {
            return res.status(404).json({
                message: 'Business profile not found. Please create a profile first.'
            });
        }

        res.status(200).json({
            message: 'Business profile updated successfully',
            businessProfile
        });
    } catch (error) {
        console.error('Error updating business profile:', error);
        res.status(500).json({
            message: 'Failed to update business profile',
            error: error.message
        });
    }
};

/**
 * @desc    Check if user has completed business profile
 * @route   GET /api/business-profile/check
 * @access  Private
 */
export const checkProfileCompletion = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('hasCompletedProfile businessProfileId');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const businessProfile = await BusinessProfile.findOne({ userId });

        res.status(200).json({
            hasCompletedProfile: user.hasCompletedProfile && !!businessProfile,
            businessProfileId: user.businessProfileId
        });
    } catch (error) {
        console.error('Error checking profile completion:', error);
        res.status(500).json({
            message: 'Failed to check profile completion',
            error: error.message
        });
    }
};

/**
 * @desc    Delete business profile (admin/testing only)
 * @route   DELETE /api/business-profile
 * @access  Private
 */
export const deleteBusinessProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const businessProfile = await BusinessProfile.findOneAndDelete({ userId });

        if (!businessProfile) {
            return res.status(404).json({ message: 'Business profile not found' });
        }

        // Update user's hasCompletedProfile flag
        await User.findByIdAndUpdate(userId, {
            hasCompletedProfile: false,
            businessProfileId: null
        });

        res.status(200).json({
            message: 'Business profile deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting business profile:', error);
        res.status(500).json({
            message: 'Failed to delete business profile',
            error: error.message
        });
    }
};
