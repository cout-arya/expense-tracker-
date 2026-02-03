import Invoice from '../models/Invoice.js';

/**
 * Invoice Number Generation Service
 * Generates sequential invoice numbers with financial year continuity
 * Format: INV-YYYY-NNNN (e.g., INV-2025-0012)
 */

/**
 * Get the current Indian financial year
 * Financial year runs from April 1 to March 31
 * @returns {number} - Calendar year of the financial year (e.g., 2025 for FY 2025-26)
 */
const getCurrentFinancialYear = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed (0 = January, 3 = April)

    // If current month is January, February, or March (0, 1, 2)
    // We're still in the previous calendar year's financial year
    if (currentMonth < 3) {
        return currentYear - 1;
    }

    return currentYear;
};

/**
 * Get the start and end dates of the current financial year
 * @returns {object} - { startDate, endDate }
 */
const getFinancialYearDates = () => {
    const fy = getCurrentFinancialYear();

    // Financial year starts on April 1
    const startDate = new Date(fy, 3, 1, 0, 0, 0, 0); // Month is 0-indexed, so 3 = April

    // Financial year ends on March 31 of next year
    const endDate = new Date(fy + 1, 2, 31, 23, 59, 59, 999); // Month 2 = March

    return { startDate, endDate };
};

/**
 * Generate the next invoice number for a user
 * Format: INV-YYYY-NNNN
 * @param {string} userId - User ID
 * @returns {Promise<string>} - Generated invoice number
 */
export const generateInvoiceNumber = async (userId) => {
    const financialYear = getCurrentFinancialYear();
    const { startDate, endDate } = getFinancialYearDates();

    // Find the last invoice for this user in the current financial year
    const lastInvoice = await Invoice.findOne({
        userId,
        invoiceDate: {
            $gte: startDate,
            $lte: endDate
        }
    })
        .sort({ invoiceNumber: -1 })
        .select('invoiceNumber')
        .lean();

    let sequenceNumber = 1;

    if (lastInvoice && lastInvoice.invoiceNumber) {
        // Extract the sequence number from the last invoice
        // Format: INV-YYYY-NNNN
        const parts = lastInvoice.invoiceNumber.split('-');
        if (parts.length === 3 && parts[0] === 'INV') {
            const lastSequence = parseInt(parts[2], 10);
            if (!isNaN(lastSequence)) {
                sequenceNumber = lastSequence + 1;
            }
        }
    }

    // Pad sequence number to 4 digits
    const paddedSequence = String(sequenceNumber).padStart(4, '0');

    // Generate invoice number: INV-YYYY-NNNN
    const invoiceNumber = `INV-${financialYear}-${paddedSequence}`;

    return invoiceNumber;
};

/**
 * Validate invoice number format
 * @param {string} invoiceNumber - Invoice number to validate
 * @returns {boolean} - true if valid, false otherwise
 */
export const validateInvoiceNumber = (invoiceNumber) => {
    if (!invoiceNumber) return false;

    // Format: INV-YYYY-NNNN
    const invoiceNumberRegex = /^INV-\d{4}-\d{4}$/;
    return invoiceNumberRegex.test(invoiceNumber);
};

/**
 * Extract financial year from invoice number
 * @param {string} invoiceNumber - Invoice number
 * @returns {number} - Financial year
 */
export const extractFinancialYear = (invoiceNumber) => {
    if (!validateInvoiceNumber(invoiceNumber)) {
        throw new Error('Invalid invoice number format');
    }

    const parts = invoiceNumber.split('-');
    return parseInt(parts[1], 10);
};

/**
 * Extract sequence number from invoice number
 * @param {string} invoiceNumber - Invoice number
 * @returns {number} - Sequence number
 */
export const extractSequenceNumber = (invoiceNumber) => {
    if (!validateInvoiceNumber(invoiceNumber)) {
        throw new Error('Invalid invoice number format');
    }

    const parts = invoiceNumber.split('-');
    return parseInt(parts[2], 10);
};

/**
 * Check if an invoice number already exists
 * @param {string} invoiceNumber - Invoice number to check
 * @returns {Promise<boolean>} - true if exists, false otherwise
 */
export const invoiceNumberExists = async (invoiceNumber) => {
    const invoice = await Invoice.findOne({ invoiceNumber }).lean();
    return !!invoice;
};
