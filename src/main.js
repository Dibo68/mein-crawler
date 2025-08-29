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

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.goto(urlToCrawl, { waitUntil: 'networkidle2' });
        
        const title = await page.title();

        // Extrahiere den gesamten Textinhalt der Seite
        const content = await page.evaluate(() => document.body.innerText);

        // NEU: Extrahiere alle Links von der Seite
        const links = await page.evaluate((baseUrl) => {
            // Finde alle <a>-Tags
            const anchors = Array.from(document.querySelectorAll('a'));
            return anchors.map(anchor => ({
                text: anchor.innerText.trim(), // Der sichtbare Text des Links
                // Wandle relative URLs (z.B. /impressum) in absolute URLs um
                href: new URL(anchor.getAttribute('href'), baseUrl).href
            }));
        }, urlToCrawl); // Übergib die Basis-URL für die Umwandlung
        
        await browser.close();
        
        res.json({ 
            success: true, 
            title: title,
            url: urlToCrawl,
            content: content,
            links: links // Füge die gefundene Link-Liste zur Antwort hinzu
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
