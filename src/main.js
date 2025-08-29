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
    const urlToCrawl = req.query.url || 'https://example.com';
    console.log(`Versuche zu crawlen: ${urlToCrawl}`);

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.goto(urlToCrawl); 
        
        const title = await page.title();

        // NEU: Extrahiere den gesamten Textinhalt der Seite
        const content = await page.evaluate(() => {
            // Wir nehmen den Text aus dem body-Tag. Du könntest das auch spezifischer machen,
            // z.B. mit document.querySelector('#main-content').innerText, wenn du nur
            // einen bestimmten Teil der Seite willst.
            return document.body.innerText;
        });
        
        await browser.close();
        
        // NEU: Füge den Inhalt (content) zur JSON-Antwort hinzu
        res.json({ 
            success: true, 
            title: title,
            url: urlToCrawl,
            content: content // Hier ist der extrahierte Text
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
