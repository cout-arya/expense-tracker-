import mongoose from 'mongoose';

const businessProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        unique: true,
        index: true
    },
    businessName: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true,
        maxlength: [200, 'Business name cannot exceed 200 characters']
    },
    businessType: {
        type: String,
        required: [true, 'Business type is required'],
        enum: {
            values: ['Freelancer', 'SME'],
            message: 'Business type must be either Freelancer or SME'
        }
    },
    gstin: {
        type: String,
        trim: true,
        uppercase: true,
        validate: {
            validator: function (v) {
                // GSTIN format: 2 digits state code + 10 digits PAN + 1 digit entity + Z + 1 check digit
                if (!v) return true; // Optional field
                return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
            },
            message: 'Invalid GSTIN format'
        }
    },
    pan: {
        type: String,
        trim: true,
        uppercase: true,
        validate: {
            validator: function (v) {
                if (!v) return true; // Optional field
                return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
            },
            message: 'Invalid PAN format'
        }
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: {
            type: String,
            required: [true, 'State is required for GST calculation'],
            trim: true
        },
        pincode: {
            type: String,
            trim: true,
            validate: {
                validator: function (v) {
                    if (!v) return true;
                    return /^[1-9][0-9]{5}$/.test(v);
                },
                message: 'Invalid pincode format'
            }
        }
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                if (!v) return true;
                return /^[6-9]\d{9}$/.test(v);
            },
            message: 'Invalid phone number format'
        }
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                if (!v) return true;
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: 'Invalid email format'
        }
    },
    logo: {
        type: String, // URL to uploaded logo
        trim: true
    },
    bankDetails: {
        accountNumber: { type: String, trim: true },
        ifsc: {
            type: String,
            trim: true,
            uppercase: true,
            validate: {
                validator: function (v) {
                    if (!v) return true;
                    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v);
                },
                message: 'Invalid IFSC code format'
            }
        },
        bankName: { type: String, trim: true },
        branch: { type: String, trim: true }
    },
    website: {
        type: String,
        trim: true
    },
    termsAndConditions: {
        type: String,
        default: 'Payment is due within 30 days of invoice date. Late payments may incur additional charges.'
    }
}, {
    timestamps: true
});

// Index for faster queries
businessProfileSchema.index({ userId: 1 });

// Virtual to get state from address
businessProfileSchema.virtual('state').get(function () {
    return this.address?.state;
});

const BusinessProfile = mongoose.model('BusinessProfile', businessProfileSchema);
export default BusinessProfile;
