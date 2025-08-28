import { CheerioCrawler } from 'crawlee';
import http from 'http';

console.log('🚀 Crawler-Server startet...');

// HTTP Server für Gesundheitschecks
const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <h1>Mein Crawler läuft!</h1>
            <p>Der Crawler ist bereit und wartet auf Aufträge.</p>
            <p>Aufruf: <a href="/crawl">/crawl</a> um zu crawlen</p>
        `);
    }
});

server.listen(3000, () => {
    console.log('✅ Server läuft auf Port 3000');
});
