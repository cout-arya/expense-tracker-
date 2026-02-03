import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { checkBusinessProfile } from '../middleware/checkBusinessProfile.js';
import {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    markInvoiceAsPaid,
    getInvoiceStats
} from '../controllers/invoiceController.js';

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// Apply business profile check to all invoice routes
router.use(checkBusinessProfile);

// Invoice statistics
router.get('/stats/summary', getInvoiceStats);

// Invoice routes
router.route('/')
    .post(createInvoice)
    .get(getInvoices);

router.route('/:id')
    .get(getInvoiceById)
    .put(updateInvoice)
    .delete(deleteInvoice);

// Mark invoice as paid
router.patch('/:id/mark-paid', markInvoiceAsPaid);

export default router;
