// Test importing controllers
console.log('Importing businessProfileController...');
import * as bpc from './controllers/businessProfileController.js';
console.log('✅ businessProfileController');

console.log('Importing clientController...');
import * as cc from './controllers/clientController.js';
console.log('✅ clientController');

console.log('Importing invoiceController...');
import * as ic from './controllers/invoiceController.js';
console.log('✅ invoiceController');

console.log('\n✅ All controllers imported successfully!');
process.exit(0);
