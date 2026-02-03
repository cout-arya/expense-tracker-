import Client from '../models/Client.js';
import Invoice from '../models/Invoice.js';

/**
 * @desc    Create a new client
 * @route   POST /api/clients
 * @access  Private
 */
export const createClient = async (req, res) => {
    try {
        const userId = req.user._id;

        const clientData = {
            userId,
            ...req.body
        };

        const client = await Client.create(clientData);

        res.status(201).json({
            message: 'Client created successfully',
            client
        });
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({
            message: 'Failed to create client',
            error: error.message
        });
    }
};

/**
 * @desc    Get all clients for logged-in user
 * @route   GET /api/clients
 * @access  Private
 */
export const getClients = async (req, res) => {
    try {
        const userId = req.user._id;
        const { search, state, sortBy = 'createdAt', order = 'desc' } = req.query;

        // Build query
        const query = { userId };

        if (search) {
            query.$or = [
                { clientName: { $regex: search, $options: 'i' } },
                { contactPerson: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (state) {
            query['address.state'] = state;
        }

        // Build sort
        const sortOrder = order === 'asc' ? 1 : -1;
        const sortOptions = { [sortBy]: sortOrder };

        const clients = await Client.find(query).sort(sortOptions);

        res.status(200).json({
            count: clients.length,
            clients
        });
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({
            message: 'Failed to fetch clients',
            error: error.message
        });
    }
};

/**
 * @desc    Get single client by ID with invoice history
 * @route   GET /api/clients/:id
 * @access  Private
 */
export const getClientById = async (req, res) => {
    try {
        const userId = req.user._id;
        const clientId = req.params.id;

        const client = await Client.findOne({ _id: clientId, userId });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Get invoice history for this client
        const invoices = await Invoice.find({ clientId, userId })
            .select('invoiceNumber invoiceDate dueDate status totalAmount')
            .sort({ invoiceDate: -1 })
            .limit(10);

        // Calculate stats
        const totalInvoices = await Invoice.countDocuments({ clientId, userId });
        const paidInvoices = await Invoice.countDocuments({ clientId, userId, status: 'Paid' });
        const totalRevenue = await Invoice.aggregate([
            { $match: { clientId: client._id, userId: req.user._id, status: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.status(200).json({
            client,
            invoiceHistory: invoices,
            stats: {
                totalInvoices,
                paidInvoices,
                pendingInvoices: totalInvoices - paidInvoices,
                totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
            }
        });
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({
            message: 'Failed to fetch client',
            error: error.message
        });
    }
};

/**
 * @desc    Update client
 * @route   PUT /api/clients/:id
 * @access  Private
 */
export const updateClient = async (req, res) => {
    try {
        const userId = req.user._id;
        const clientId = req.params.id;

        const client = await Client.findOneAndUpdate(
            { _id: clientId, userId },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.status(200).json({
            message: 'Client updated successfully',
            client
        });
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({
            message: 'Failed to update client',
            error: error.message
        });
    }
};

/**
 * @desc    Delete client
 * @route   DELETE /api/clients/:id
 * @access  Private
 */
export const deleteClient = async (req, res) => {
    try {
        const userId = req.user._id;
        const clientId = req.params.id;

        // Check if client has any invoices
        const invoiceCount = await Invoice.countDocuments({ clientId, userId });

        if (invoiceCount > 0) {
            return res.status(400).json({
                message: `Cannot delete client. ${invoiceCount} invoice(s) are associated with this client.`,
                invoiceCount
            });
        }

        const client = await Client.findOneAndDelete({ _id: clientId, userId });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.status(200).json({
            message: 'Client deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({
            message: 'Failed to delete client',
            error: error.message
        });
    }
};
