import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    const outputDir = path.join(__dirname, '..', 'docs');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 1280, height: 800 }
    });
    const page = await browser.newPage();

    const baseUrl = 'http://localhost:5173';

    try {

        // 0. Landing Page
        console.log('Capturing Landing Page...');
        await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle0' });
        await page.screenshot({ path: path.join(outputDir, 'landing_page_screenshot.png') });

        // 1. Login Page
        console.log('Navigating to Login...');
        await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle0' });
        await page.screenshot({ path: path.join(outputDir, 'login_screenshot.png') });

        // 2. Perform Login
        console.log('Logging in...');
        await page.type('input[name="email"]', 'testuser_localized@example.com');
        await page.type('input[name="password"]', 'password123');

        // Find and click submit button
        const submitBtn = await page.$('button[type="submit"]');
        await submitBtn.click();

        // Wait for navigation to dashboard
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        console.log('Logged in successfully.');

        // 3. Dashboard
        console.log('Capturing Dashboard...');
        // Give it a moment for animations/charts
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(outputDir, 'dashboard_screenshot.png') });

        // 4. Invoices List
        console.log('Capturing Invoice List...');
        await page.goto(`${baseUrl}/invoices`, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(outputDir, 'invoice_list_screenshot.png') });

        // 5. Create Invoice
        console.log('Capturing Create Invoice...');
        await page.goto(`${baseUrl}/invoices/create`, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(outputDir, 'create_invoice_screenshot.png') });

        // 6. Clients
        console.log('Capturing Clients...');
        await page.goto(`${baseUrl}/clients`, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(outputDir, 'clients_screenshot.png') });

        // 7. Expenses
        console.log('Capturing Expenses...');
        await page.goto(`${baseUrl}/expenses`, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(outputDir, 'expenses_screenshot.png') });

        // 8. Insights
        console.log('Capturing Insights...');
        await page.goto(`${baseUrl}/insights`, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 2000)); // Charts take longer
        await page.screenshot({ path: path.join(outputDir, 'insights_screenshot.png') });

        // 9. Income
        console.log('Capturing Income...');
        await page.goto(`${baseUrl}/income`, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(outputDir, 'income_screenshot.png') });

        // 10. Budget
        console.log('Capturing Budget...');
        await page.goto(`${baseUrl}/budget`, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(outputDir, 'budget_screenshot.png') });

        console.log('All screenshots captured!');

    } catch (error) {
        console.error('Error capturing screenshots:', error);
    } finally {
        await browser.close();
    }
})();
