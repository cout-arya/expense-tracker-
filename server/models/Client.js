import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    clientName: {
        type: String,
        required: [true, 'Client name is required'],
        trim: true,
        maxlength: [200, 'Client name cannot exceed 200 characters']
    },
    contactPerson: {
        type: String,
        trim: true,
        maxlength: [100, 'Contact person name cannot exceed 100 characters']
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
    gstin: {
        type: String,
        trim: true,
        uppercase: true,
        validate: {
            validator: function (v) {
                if (!v) return true; // Optional field
                return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
            },
            message: 'Invalid GSTIN format'
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
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Indexes for faster queries
clientSchema.index({ userId: 1, clientName: 1 });
clientSchema.index({ userId: 1, createdAt: -1 });

// Virtual to get state
clientSchema.virtual('state').get(function () {
    return this.address?.state;
});

const Client = mongoose.model('Client', clientSchema);
export default Client;
