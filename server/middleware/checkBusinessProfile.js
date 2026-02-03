import User from '../models/User.js';
import BusinessProfile from '../models/BusinessProfile.js';

/**
 * Middleware to check if user has completed their business profile
 * This should be used on routes that require business profile (like invoice creation)
 */
export const checkBusinessProfile = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Check if user has completed profile flag
        const user = await User.findById(userId).select('hasCompletedProfile businessProfileId');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.hasCompletedProfile) {
            return res.status(403).json({
                message: 'Please complete your business profile setup before accessing this feature.',
                requiresProfileSetup: true
            });
        }

        // Verify business profile actually exists
        const businessProfile = await BusinessProfile.findOne({ userId });

        if (!businessProfile) {
            // Update user flag if profile doesn't exist
            await User.findByIdAndUpdate(userId, { hasCompletedProfile: false });

            return res.status(403).json({
                message: 'Business profile not found. Please complete your profile setup.',
                requiresProfileSetup: true
            });
        }

        // Attach business profile to request for easy access
        req.businessProfile = businessProfile;

        next();
    } catch (error) {
        console.error('Error checking business profile:', error);
        res.status(500).json({
            message: 'Error verifying business profile',
            error: error.message
        });
    }
};
