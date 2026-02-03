# TruBalance Backend API Testing

## Test the backend APIs using these curl commands or a tool like Postman

### 1. Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "_id": "...",
  "name": "Test User",
  "email": "test@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the token** - you'll need it for all subsequent requests!

---

### 2. Check Business Profile Completion
```bash
curl -X GET http://localhost:5000/api/business-profile/check \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "hasCompletedProfile": false,
  "businessProfileId": null
}
```

---

### 3. Create Business Profile
```bash
curl -X POST http://localhost:5000/api/business-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "businessName": "My Freelance Business",
    "businessType": "Freelancer",
    "gstin": "27AAPFU0939F1ZV",
    "pan": "AAPFU0939F",
    "email": "business@example.com",
    "phone": "9876543210",
    "address": {
      "street": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "bankDetails": {
      "accountNumber": "1234567890",
      "ifsc": "SBIN0001234",
      "bankName": "State Bank of India",
      "branch": "Mumbai Main"
    }
  }'
```

**Expected Response:**
```json
{
  "message": "Business profile created successfully",
  "businessProfile": { ... }
}
```

---

### 4. Create a Client
```bash
curl -X POST http://localhost:5000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "clientName": "ABC Corporation",
    "contactPerson": "John Doe",
    "email": "john@abccorp.com",
    "phone": "9123456789",
    "gstin": "07AABCU9603R1ZX",
    "address": {
      "street": "456 Business Park",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110001"
    }
  }'
```

**Expected Response:**
```json
{
  "message": "Client created successfully",
  "client": { ... }
}
```

**Save the client _id** - you'll need it to create an invoice!

---

### 5. Create an Invoice (GST Calculation Test)
```bash
curl -X POST http://localhost:5000/api/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "clientId": "CLIENT_ID_HERE",
    "dueDate": "2026-03-15",
    "status": "Draft",
    "lineItems": [
      {
        "itemName": "Web Development Services",
        "description": "Full-stack development for 1 month",
        "quantity": 1,
        "rate": 50000,
        "discount": 0,
        "gstPercentage": 18
      },
      {
        "itemName": "UI/UX Design",
        "description": "Design mockups and prototypes",
        "quantity": 1,
        "rate": 25000,
        "discount": 2000,
        "gstPercentage": 18
      }
    ],
    "notes": "Thank you for your business!",
    "termsAndConditions": "Payment due within 30 days"
  }'
```

**Expected Response (Inter-state: Maharashtra → Delhi):**
```json
{
  "message": "Invoice created successfully",
  "invoice": {
    "invoiceNumber": "INV-2025-0001",
    "subtotal": 73000,
    "taxAmount": 13140,
    "totalAmount": 86140,
    "taxBreakup": {
      "cgst": 0,
      "sgst": 0,
      "igst": 13140
    },
    ...
  }
}
```

**GST Breakdown:**
- Item 1: ₹50,000 × 18% = ₹9,000 IGST
- Item 2: (₹25,000 - ₹2,000) × 18% = ₹4,140 IGST
- **Total IGST**: ₹13,140 (because Maharashtra ≠ Delhi)

---

### 6. Test Intra-State GST (Create another client in Maharashtra)
```bash
# First, create a client in Maharashtra
curl -X POST http://localhost:5000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "clientName": "XYZ Enterprises",
    "contactPerson": "Jane Smith",
    "email": "jane@xyzent.com",
    "phone": "9234567890",
    "address": {
      "street": "789 Tech Hub",
      "city": "Pune",
      "state": "Maharashtra",
      "pincode": "411001"
    }
  }'

# Then create an invoice for this client
curl -X POST http://localhost:5000/api/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "clientId": "NEW_CLIENT_ID_HERE",
    "dueDate": "2026-03-20",
    "status": "Draft",
    "lineItems": [
      {
        "itemName": "Consulting Services",
        "quantity": 1,
        "rate": 30000,
        "discount": 0,
        "gstPercentage": 18
      }
    ]
  }'
```

**Expected Response (Intra-state: Maharashtra → Maharashtra):**
```json
{
  "invoice": {
    "invoiceNumber": "INV-2025-0002",
    "subtotal": 30000,
    "taxAmount": 5400,
    "totalAmount": 35400,
    "taxBreakup": {
      "cgst": 2700,
      "sgst": 2700,
      "igst": 0
    }
  }
}
```

**GST Breakdown:**
- ₹30,000 × 18% = ₹5,400 total
- **CGST**: ₹2,700 (9%)
- **SGST**: ₹2,700 (9%)
- **IGST**: ₹0 (because both in Maharashtra)

---

### 7. Get All Invoices
```bash
curl -X GET "http://localhost:5000/api/invoices?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 8. Get Invoice Statistics
```bash
curl -X GET http://localhost:5000/api/invoices/stats/summary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "totalInvoices": 2,
  "draftInvoices": 2,
  "sentInvoices": 0,
  "paidInvoices": 0,
  "overdueInvoices": 0,
  "totalRevenue": 0,
  "pendingAmount": 0
}
```

---

### 9. Mark Invoice as Paid
```bash
curl -X PATCH http://localhost:5000/api/invoices/INVOICE_ID_HERE/mark-paid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "paymentDate": "2026-02-03",
    "paymentMethod": "Bank Transfer",
    "paymentReference": "TXN123456"
  }'
```

---

### 10. Get All Clients
```bash
curl -X GET http://localhost:5000/api/clients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Testing Checklist

✅ **Server Running**: Port 5000  
✅ **MongoDB Connected**  
✅ **User Registration**: Creates user with JWT token  
✅ **Business Profile**: Required before creating invoices  
✅ **Client Management**: CRUD operations  
✅ **Invoice Creation**: Auto-numbering (INV-2025-0001)  
✅ **GST Calculation**:
  - Inter-state (Maharashtra → Delhi) = IGST only
  - Intra-state (Maharashtra → Maharashtra) = CGST + SGST  
✅ **Invoice Statistics**: Dashboard metrics  
✅ **Payment Tracking**: Mark invoices as paid  

---

## Expected GST Behavior

| Seller State | Buyer State | Tax Type | Example |
|--------------|-------------|----------|---------|
| Maharashtra | Maharashtra | CGST + SGST | ₹10,000 @ 18% = ₹900 CGST + ₹900 SGST |
| Maharashtra | Delhi | IGST | ₹10,000 @ 18% = ₹1,800 IGST |
| Delhi | Karnataka | IGST | ₹10,000 @ 18% = ₹1,800 IGST |
| Tamil Nadu | Tamil Nadu | CGST + SGST | ₹10,000 @ 18% = ₹900 CGST + ₹900 SGST |

---

## Notes

- Replace `YOUR_TOKEN_HERE` with the actual JWT token from registration/login
- Replace `CLIENT_ID_HERE` with the actual client `_id` from the create client response
- Replace `INVOICE_ID_HERE` with the actual invoice `_id`
- All amounts are in Indian Rupees (₹)
- Invoice numbers auto-increment per financial year (April-March)
