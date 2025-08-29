import puppeteer from 'puppeteer';
import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send(`
        <h1>Puppeteer Crawler läuft!</h1>
        <p><a href="/crawl?url=https://example.com">Crawl starten</a></p>
    `);
});

app.get('/crawl', async (req, res) => {
    const urlToCrawl = req.query.url;
    if (!urlToCrawl) {
        return res.status(400).json({ success: false, error: 'Keine URL übergeben.' });
    }

    console.log(`Versuche zu crawlen: ${urlToCrawl}`);
    let browser; // Definiere den Browser außerhalb des try-Blocks

    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-extensions'
            ]
        });
        
        const page = await browser.newPage();

        // --- NEUE TARNUNGS-EINSTELLUNGEN ---
        
        // 1. Setze einen realistischen User-Agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');

        // 2. Setze eine typische Browser-Fenstergröße (Viewport)
        await page.setViewport({ width: 1920, height: 1080 });

        // --- ENDE DER TARNUNGS-EINSTELLUNGEN ---
        
        await page.goto(urlToCrawl, { waitUntil: 'networkidle2' });
        
        const title = await page.title();
        const content = await page.evaluate(() => document.body.innerText);
        const links = await page.evaluate((baseUrl) => {
            const anchors = Array.from(document.querySelectorAll('a'));
            return anchors.map(anchor => ({
                text: anchor.innerText.trim(),
                href: new URL(anchor.getAttribute('href'), baseUrl).href
            }));
        }, urlToCrawl);
        
        await browser.close();
        
        res.json({ 
            success: true, 
            title: title,
            url: urlToCrawl,
            content: content,
            links: links
        });

    } catch (error) {
        console.error(`Fehler beim Crawlen von ${urlToCrawl}:`, error);
        if (browser) {
            await browser.close(); // Stelle sicher, dass der Browser auch bei Fehlern geschlossen wird
        }
        res.status(500).json({ 
            success: false, 
            error: error.message,
            url: urlToCrawl
        });
    }
});

app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
});
