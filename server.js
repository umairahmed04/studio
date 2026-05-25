/**
 * Production Server Entry Point for Scala Hosting / cPanel
 * Optimized for Passenger and custom Node.js environments.
 * Handles production routing and direct URL access.
 */
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Scala Hosting / Passenger usually passes the port via process.env.PORT
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    
    // Ensure all requests are handled by Next.js for robust App Router support
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> ATS Resume Scan Production Server Ready on port ${port}`);
    console.log(`> Domain: https://atsresumescan.com`);
  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});
