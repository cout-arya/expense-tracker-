import Invoice from '../models/Invoice.js';
import InvoiceLineItem from '../models/InvoiceLineItem.js';
import Client from '../models/Client.js';
import BusinessProfile from '../models/BusinessProfile.js';
import { generateInvoiceNumber } from '../services/invoiceNumberService.js';
import { calculateGST } from '../services/gstCalculationService.js';

/**
 * @desc    Create a new invoice
 * @route   POST /api/invoices
 * @access  Private
 */
export const createInvoice = async (req, res) => {
    try {
        const userId = req.user._id;
        const { clientId, dueDate, lineItems, notes, termsAndConditions, status = 'Draft' } = req.body;

        // Validate client exists and belongs to user
        const client = await Client.findOne({ _id: clientId, userId });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Get business profile for GST calculation
        const businessProfile = await BusinessProfile.findOne({ userId });
        if (!businessProfile) {
            return res.status(400).json({
                message: 'Business profile not found. Please complete your profile setup first.'
            });
        }

        // Generate invoice number
        const invoiceNumber = await generateInvoiceNumber(userId);

        // Create invoice
        const invoice = await Invoice.create({
            userId,
            invoiceNumber,
            clientId,
            invoiceDate: new Date(),
            dueDate: new Date(dueDate),
            status,
            notes,
            termsAndConditions: termsAndConditions || businessProfile.termsAndConditions
        });

        // Create line items and calculate GST
        const createdLineItems = [];
        let totalCGST = 0;
        let totalSGST = 0;
        let totalIGST = 0;

        for (const item of lineItems) {
            // Create line item
            const lineItem = await InvoiceLineItem.create({
                invoiceId: invoice._id,
                ...item
            });

            createdLineItems.push(lineItem);

            // Calculate GST for this line item
            const sellerState = businessProfile.address.state;
            const buyerState = client.address.state;

            const gstBreakup = calculateGST(
                sellerState,
                buyerState,
                lineItem.itemTotal,
                lineItem.gstPercentage
            );

            totalCGST += gstBreakup.cgst;
            totalSGST += gstBreakup.sgst;
            totalIGST += gstBreakup.igst;
        }

        // Update invoice with line items and totals
        invoice.lineItems = createdLineItems.map(item => item._id);
        invoice.taxBreakup = {
            cgst: Number(totalCGST.toFixed(2)),
            sgst: Number(totalSGST.toFixed(2)),
            igst: Number(totalIGST.toFixed(2))
        };

        // Calculate totals
        await invoice.calculateTotals();
        await invoice.save();

        // Populate and return
        const populatedInvoice = await Invoice.findById(invoice._id)
            .populate('clientId')
            .populate('lineItems');

        res.status(201).json({
            message: 'Invoice created successfully',
            invoice: populatedInvoice
        });
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({
            message: 'Failed to create invoice',
            error: error.message
        });
    }
};

/**
 * @desc    Get all invoices for logged-in user
 * @route   GET /api/invoices
 * @access  Private
 */
export const getInvoices = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            status,
            clientId,
            startDate,
            endDate,
            search,
            sortBy = 'invoiceDate',
            order = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        // Build query
        const query = { userId };

        if (status) {
            query.status = status;
        }

        if (clientId) {
            query.clientId = clientId;
        }

        if (startDate || endDate) {
            query.invoiceDate = {};
            if (startDate) query.invoiceDate.$gte = new Date(startDate);
            if (endDate) query.invoiceDate.$lte = new Date(endDate);
        }

        if (search) {
            query.invoiceNumber = { $regex: search, $options: 'i' };
        }

        // Build sort
        const sortOrder = order === 'asc' ? 1 : -1;
        const sortOptions = { [sortBy]: sortOrder };

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const invoices = await Invoice.find(query)
            .populate('clientId', 'clientName email phone')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Invoice.countDocuments(query);

        res.status(200).json({
            invoices,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({
            message: 'Failed to fetch invoices',
            error: error.message
        });
    }
};

/**
 * @desc    Get single invoice by ID
 * @route   GET /api/invoices/:id
 * @access  Private
 */
export const getInvoiceById = async (req, res) => {
    try {
        const userId = req.user._id;
        const invoiceId = req.params.id;

        const invoice = await Invoice.findOne({ _id: invoiceId, userId })
            .populate('clientId')
            .populate('lineItems');

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Also get business profile for invoice display
        const businessProfile = await BusinessProfile.findOne({ userId });

        res.status(200).json({
            invoice,
            businessProfile
        });
    } catch (error) {
        console.error('Error fetching invoice:', error);
        res.status(500).json({
            message: 'Failed to fetch invoice',
            error: error.message
        });
    }
};

/**
 * @desc    Update invoice
 * @route   PUT /api/invoices/:id
 * @access  Private
 */
export const updateInvoice = async (req, res) => {
    try {
        const userId = req.user._id;
        const invoiceId = req.params.id;
        const { lineItems, ...invoiceData } = req.body;

        const invoice = await Invoice.findOne({ _id: invoiceId, userId });

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Update invoice fields
        Object.assign(invoice, invoiceData);

        // If line items are provided, update them
        if (lineItems && Array.isArray(lineItems)) {
            // Delete old line items
            await InvoiceLineItem.deleteMany({ invoiceId: invoice._id });

            // Get business profile and client for GST calculation
            const businessProfile = await BusinessProfile.findOne({ userId });
            const client = await Client.findById(invoice.clientId);

            // Create new line items and recalculate GST
            const createdLineItems = [];
            let totalCGST = 0;
            let totalSGST = 0;
            let totalIGST = 0;

            for (const item of lineItems) {
                const lineItem = await InvoiceLineItem.create({
                    invoiceId: invoice._id,
                    ...item
                });

                createdLineItems.push(lineItem);

                // Calculate GST
                const gstBreakup = calculateGST(
                    businessProfile.address.state,
                    client.address.state,
                    lineItem.itemTotal,
                    lineItem.gstPercentage
                );

                totalCGST += gstBreakup.cgst;
                totalSGST += gstBreakup.sgst;
                totalIGST += gstBreakup.igst;
            }

            invoice.lineItems = createdLineItems.map(item => item._id);
            invoice.taxBreakup = {
                cgst: Number(totalCGST.toFixed(2)),
                sgst: Number(totalSGST.toFixed(2)),
                igst: Number(totalIGST.toFixed(2))
            };

            await invoice.calculateTotals();
        }

        await invoice.save();

        const updatedInvoice = await Invoice.findById(invoice._id)
            .populate('clientId')
            .populate('lineItems');

        res.status(200).json({
            message: 'Invoice updated successfully',
            invoice: updatedInvoice
        });
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({
            message: 'Failed to update invoice',
            error: error.message
        });
    }
};

/**
 * @desc    Delete invoice
 * @route   DELETE /api/invoices/:id
 * @access  Private
 */
export const deleteInvoice = async (req, res) => {
    try {
        const userId = req.user._id;
        const invoiceId = req.params.id;

        const invoice = await Invoice.findOne({ _id: invoiceId, userId });

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Prevent deletion of paid invoices
        if (invoice.status === 'Paid') {
            return res.status(400).json({
                message: 'Cannot delete paid invoices. Please cancel the invoice instead.'
            });
        }

        // Delete associated line items
        await InvoiceLineItem.deleteMany({ invoiceId: invoice._id });

        // Delete invoice
        await Invoice.findByIdAndDelete(invoice._id);

        res.status(200).json({
            message: 'Invoice deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({
            message: 'Failed to delete invoice',
            error: error.message
        });
    }
};

/**
 * @desc    Mark invoice as paid
 * @route   PATCH /api/invoices/:id/mark-paid
 * @access  Private
 */
export const markInvoiceAsPaid = async (req, res) => {
    try {
        const userId = req.user._id;
        const invoiceId = req.params.id;
        const { paymentDate, paymentMethod, paymentReference } = req.body;

        const invoice = await Invoice.findOneAndUpdate(
            { _id: invoiceId, userId },
            {
                status: 'Paid',
                paymentDate: paymentDate || new Date(),
                paymentMethod,
                paymentReference
            },
            { new: true }
        ).populate('clientId').populate('lineItems');

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.status(200).json({
            message: 'Invoice marked as paid',
            invoice
        });
    } catch (error) {
        console.error('Error marking invoice as paid:', error);
        res.status(500).json({
            message: 'Failed to mark invoice as paid',
            error: error.message
        });
    }
};

/**
 * @desc    Get invoice statistics
 * @route   GET /api/invoices/stats/summary
 * @access  Private
 */
export const getInvoiceStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const totalInvoices = await Invoice.countDocuments({ userId });
        const draftInvoices = await Invoice.countDocuments({ userId, status: 'Draft' });
        const sentInvoices = await Invoice.countDocuments({ userId, status: 'Sent' });
        const paidInvoices = await Invoice.countDocuments({ userId, status: 'Paid' });
        const overdueInvoices = await Invoice.countDocuments({ userId, status: 'Overdue' });

        const totalRevenue = await Invoice.aggregate([
            { $match: { userId: req.user._id, status: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const pendingAmount = await Invoice.aggregate([
            { $match: { userId: req.user._id, status: { $in: ['Sent', 'Overdue'] } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.status(200).json({
            totalInvoices,
            draftInvoices,
            sentInvoices,
            paidInvoices,
            overdueInvoices,
            totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
            pendingAmount: pendingAmount.length > 0 ? pendingAmount[0].total : 0
        });
    } catch (error) {
        console.error('Error fetching invoice stats:', error);
        res.status(500).json({
            message: 'Failed to fetch invoice statistics',
            error: error.message
        });
    }
};
