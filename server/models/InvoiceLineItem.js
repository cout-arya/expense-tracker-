import mongoose from 'mongoose';

const invoiceLineItemSchema = new mongoose.Schema({
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
        required: [true, 'Invoice ID is required'],
        index: true
    },
    itemName: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true,
        maxlength: [200, 'Item name cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1'],
        default: 1
    },
    rate: {
        type: Number,
        required: [true, 'Rate is required'],
        min: [0, 'Rate cannot be negative']
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative']
    },
    gstPercentage: {
        type: Number,
        required: [true, 'GST percentage is required'],
        enum: {
            values: [0, 5, 12, 18, 28],
            message: 'GST percentage must be 0%, 5%, 12%, 18%, or 28%'
        },
        default: 18
    },
    itemTotal: {
        type: Number,
        default: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Pre-save hook to calculate itemTotal and taxAmount
invoiceLineItemSchema.pre('save', function (next) {
    // Calculate item total: (quantity × rate) - discount
    this.itemTotal = (this.quantity * this.rate) - this.discount;

    // Calculate tax amount based on GST percentage
    this.taxAmount = (this.itemTotal * this.gstPercentage) / 100;

    next();
});

// Index for faster queries
invoiceLineItemSchema.index({ invoiceId: 1 });

const InvoiceLineItem = mongoose.model('InvoiceLineItem', invoiceLineItemSchema);
export default InvoiceLineItem;
