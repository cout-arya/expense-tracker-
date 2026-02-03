import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    invoiceNumber: {
        type: String,
        required: [true, 'Invoice number is required'],
        unique: true,
        trim: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'Client ID is required']
    },
    invoiceDate: {
        type: Date,
        required: [true, 'Invoice date is required'],
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    status: {
        type: String,
        enum: {
            values: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'],
            message: 'Status must be Draft, Sent, Paid, Overdue, or Cancelled'
        },
        default: 'Draft'
    },
    lineItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InvoiceLineItem'
    }],
    subtotal: {
        type: Number,
        default: 0,
        min: [0, 'Subtotal cannot be negative']
    },
    taxAmount: {
        type: Number,
        default: 0,
        min: [0, 'Tax amount cannot be negative']
    },
    totalAmount: {
        type: Number,
        default: 0,
        min: [0, 'Total amount cannot be negative']
    },
    taxBreakup: {
        cgst: { type: Number, default: 0 },
        sgst: { type: Number, default: 0 },
        igst: { type: Number, default: 0 }
    },
    notes: {
        type: String,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    termsAndConditions: {
        type: String,
        maxlength: [2000, 'Terms and conditions cannot exceed 2000 characters']
    },
    // Additional metadata
    paymentDate: {
        type: Date
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card', 'Other']
    },
    paymentReference: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Indexes for faster queries
invoiceSchema.index({ userId: 1, invoiceDate: -1 });
invoiceSchema.index({ userId: 1, status: 1 });
invoiceSchema.index({ userId: 1, clientId: 1 });
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });

// Virtual to check if invoice is overdue
invoiceSchema.virtual('isOverdue').get(function () {
    if (this.status === 'Paid' || this.status === 'Cancelled') {
        return false;
    }
    return new Date() > this.dueDate;
});

// Method to calculate totals from line items
invoiceSchema.methods.calculateTotals = async function () {
    const InvoiceLineItem = mongoose.model('InvoiceLineItem');
    const lineItems = await InvoiceLineItem.find({ invoiceId: this._id });

    this.subtotal = lineItems.reduce((sum, item) => sum + item.itemTotal, 0);
    this.taxAmount = lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
    this.totalAmount = this.subtotal + this.taxAmount;

    return this;
};

// Pre-save hook to auto-update overdue status
invoiceSchema.pre('save', function (next) {
    if (this.status !== 'Paid' && this.status !== 'Cancelled' && this.isOverdue) {
        this.status = 'Overdue';
    }
    next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
