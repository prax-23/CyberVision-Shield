import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import app from './app.js';

// Load environment variables
dotenv.config();

// Create Express Server
const PORT = process.env.PORT || 3000;

// Connect to Database (In-Memory or Local/External URI)
connectDB().catch((error) => {
  console.error(`Error connecting to MongoDB: ${error.message}`);
  process.exit(1);
});

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets from frontend build directory
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Serve frontend index.html for any other requests (client-side routing fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`================================================`);
  console.log(` CyberShield Security Backend running on port ${PORT}`);
  console.log(` Active environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`================================================`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down server...');
  server.close(async () => {
    import('./config/db.js').then(({ closeDB }) => closeDB());
    console.log('Express server closed.');
  });
});
