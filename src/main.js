import puppeteer from 'puppeteer';
import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send(`
        <h1>Puppeteer Crawler läuft!</h1>
        <p><a href="/crawl">Crawl starten</a></p>
    `);
});

app.get('/crawl', async (req, res) => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.goto('https://example.com');
        const title = await page.title();
        
        await browser.close();
        
        res.json({ 
            success: true, 
            title: title,
            url: 'https://example.com'
        });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
});
