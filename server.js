/**
 * Production Server Entry Point for Scala Hosting / cPanel
 * Optimized for Passenger and custom Node.js environments.
 * Handles production routing and direct URL access.
 */
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Ensure we are in production mode for server execution
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Scala Hosting / Passenger usually passes the port via process.env.PORT
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    // Standard Next.js request handling
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
    console.log(`> ATS Resume Scan Production Server Ready on port ${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch((ex) => {
  console.error('Production startup error:', ex.stack);
  process.exit(1);
});
