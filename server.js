/**
 * Production Server Entry Point for Scala Hosting & Standalone Deployments
 * Optimized for cPanel/Passenger and high-traffic environments.
 */
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Detect environment
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Scala Hosting usually passes the port via process.env.PORT
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      // Ensure all requests are piped through the Next.js handler
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Request Handling Error:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, (err) => {
    if (err) {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
    console.log(`> ATS Resume Scan Production Server Ready on port ${port}`);
    console.log(`> Mode: ${dev ? 'Development' : 'Production'}`);
  });
}).catch((ex) => {
  console.error('Fatal Startup Error:', ex.stack);
  process.exit(1);
});
