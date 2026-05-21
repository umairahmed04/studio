/**
 * Production Server Entry Point for Namecheap/cPanel
 * 
 * Instructions:
 * 1. Build the app locally: npm run build
 * 2. Upload the .next, public, and server.js files to your server
 * 3. In cPanel "Setup Node.js App", set the "Application startup file" to server.js
 */
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Namecheap/Passenger usually passes the port via process.env.PORT
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> ATS Resume Scan Ready on port ${port}`);
  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});
