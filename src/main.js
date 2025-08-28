import { CheerioCrawler } from 'crawlee';

// Erstelle einen einfachen Crawler
const crawler = new CheerioCrawler({
    // Maximal 2 Seiten crawlen (für den Test)
    maxRequestsPerCrawl: 2,
    
    // Was soll mit jeder gefundenen Seite passieren?
    async requestHandler({ $, request, log }) {
        const title = $('title').text();
        log.info(`Titel gefunden: ${title}`, { url: request.loadedUrl });
        
        // Speichere die Daten
        await crawler.exportData([{
            url: request.loadedUrl,
            title: title,
            timestamp: new Date().toISOString()
        }]);
    },
});

// Starte den Crawler
console.log('🚀 Crawler startet...');
await crawler.run(['https://example.com']);
console.log('✅ Crawler fertig!');
