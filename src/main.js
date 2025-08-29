import puppeteer from 'puppeteer';
import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send(`
        <h1>Puppeteer Crawler läuft!</h1>
        <p><a href="/crawl">Crawl starten</a> (nutzt example.com als Standard)</p>
    `);
});

app.get('/crawl', async (req, res) => {
    // NEU: Lese den 'url' Parameter aus der Anfrage.
    // Falls kein Parameter übergeben wird, nutze 'https://example.com' als Standard.
    const urlToCrawl = req.query.url || 'https://example.com';

    // Log-Ausgabe auf dem Server zur Fehlerbehebung
    console.log(`Versuche zu crawlen: ${urlToCrawl}`);

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // NEU: Nutze die dynamische URL aus der Anfrage
        await page.goto(urlToCrawl); 
        
        const title = await page.title();
        
        await browser.close();
        
        // NEU: Gib die tatsächlich gecrawlte URL im Ergebnis zurück
        res.json({ 
            success: true, 
            title: title,
            url: urlToCrawl 
        });
    } catch (error) {
        console.error(`Fehler beim Crawlen von ${urlToCrawl}:`, error);
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
