/**
 * GST Calculation Service
 * Handles all GST-related calculations and validations for Indian invoicing
 */

/**
 * Calculate GST based on seller and buyer states
 * @param {string} sellerState - State of the seller (from business profile)
 * @param {string} buyerState - State of the buyer (from client details)
 * @param {number} amount - Taxable amount
 * @param {number} gstRate - GST rate percentage (5, 12, 18, 28)
 * @returns {object} - { cgst, sgst, igst, totalTax }
 */
export const calculateGST = (sellerState, buyerState, amount, gstRate) => {
    if (!sellerState || !buyerState) {
        throw new Error('Seller and buyer states are required for GST calculation');
    }

    if (!amount || amount < 0) {
        throw new Error('Valid taxable amount is required');
    }

    if (![0, 5, 12, 18, 28].includes(gstRate)) {
        throw new Error('GST rate must be 0%, 5%, 12%, 18%, or 28%');
    }

    // Normalize state names for comparison (case-insensitive, trim whitespace)
    const normalizedSellerState = sellerState.trim().toLowerCase();
    const normalizedBuyerState = buyerState.trim().toLowerCase();

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (normalizedSellerState === normalizedBuyerState) {
        // Intra-state transaction: Apply CGST + SGST
        // Split GST equally between Central and State
        const halfGst = (amount * gstRate) / 2 / 100;
        cgst = Math.round(halfGst * 100) / 100; // Round to 2 decimal places
        sgst = Math.round(halfGst * 100) / 100;
    } else {
        // Inter-state transaction: Apply IGST only
        igst = Math.round((amount * gstRate) / 100 * 100) / 100;
    }

    const totalTax = cgst + sgst + igst;

    return {
        cgst: Number(cgst.toFixed(2)),
        sgst: Number(sgst.toFixed(2)),
        igst: Number(igst.toFixed(2)),
        totalTax: Number(totalTax.toFixed(2))
    };
};

/**
 * Validate GSTIN format
 * Format: 2 digits state code + 10 digits PAN + 1 digit entity + Z + 1 check digit
 * Example: 27AAPFU0939F1ZV
 * @param {string} gstin - GSTIN to validate
 * @returns {boolean} - true if valid, false otherwise
 */
export const validateGSTIN = (gstin) => {
    if (!gstin) return false;

    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin.trim().toUpperCase());
};

/**
 * Extract state code from GSTIN
 * First 2 digits represent the state code
 * @param {string} gstin - Valid GSTIN
 * @returns {string} - State code (2 digits)
 */
export const extractStateCodeFromGSTIN = (gstin) => {
    if (!validateGSTIN(gstin)) {
        throw new Error('Invalid GSTIN format');
    }

    return gstin.substring(0, 2);
};

/**
 * Map of Indian state codes to state names
 */
export const STATE_CODE_MAP = {
    '01': 'Jammu and Kashmir',
    '02': 'Himachal Pradesh',
    '03': 'Punjab',
    '04': 'Chandigarh',
    '05': 'Uttarakhand',
    '06': 'Haryana',
    '07': 'Delhi',
    '08': 'Rajasthan',
    '09': 'Uttar Pradesh',
    '10': 'Bihar',
    '11': 'Sikkim',
    '12': 'Arunachal Pradesh',
    '13': 'Nagaland',
    '14': 'Manipur',
    '15': 'Mizoram',
    '16': 'Tripura',
    '17': 'Meghalaya',
    '18': 'Assam',
    '19': 'West Bengal',
    '20': 'Jharkhand',
    '21': 'Odisha',
    '22': 'Chhattisgarh',
    '23': 'Madhya Pradesh',
    '24': 'Gujarat',
    '25': 'Daman and Diu',
    '26': 'Dadra and Nagar Haveli',
    '27': 'Maharashtra',
    '28': 'Andhra Pradesh',
    '29': 'Karnataka',
    '30': 'Goa',
    '31': 'Lakshadweep',
    '32': 'Kerala',
    '33': 'Tamil Nadu',
    '34': 'Puducherry',
    '35': 'Andaman and Nicobar Islands',
    '36': 'Telangana',
    '37': 'Andhra Pradesh',
    '38': 'Ladakh'
};

/**
 * Get state name from state code
 * @param {string} stateCode - 2-digit state code
 * @returns {string} - State name
 */
export const getStateNameFromCode = (stateCode) => {
    return STATE_CODE_MAP[stateCode] || 'Unknown';
};

/**
 * Validate PAN format
 * Format: 5 letters + 4 digits + 1 letter
 * Example: AAPFU0939F
 * @param {string} pan - PAN to validate
 * @returns {boolean} - true if valid, false otherwise
 */
export const validatePAN = (pan) => {
    if (!pan) return false;

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.trim().toUpperCase());
};

/**
 * Calculate total invoice amount with GST
 * @param {Array} lineItems - Array of line items with itemTotal and taxAmount
 * @returns {object} - { subtotal, totalTax, totalAmount }
 */
export const calculateInvoiceTotal = (lineItems) => {
    if (!Array.isArray(lineItems) || lineItems.length === 0) {
        return { subtotal: 0, totalTax: 0, totalAmount: 0 };
    }

    const subtotal = lineItems.reduce((sum, item) => sum + (item.itemTotal || 0), 0);
    const totalTax = lineItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
    const totalAmount = subtotal + totalTax;

    return {
        subtotal: Number(subtotal.toFixed(2)),
        totalTax: Number(totalTax.toFixed(2)),
        totalAmount: Number(totalAmount.toFixed(2))
    };
};
