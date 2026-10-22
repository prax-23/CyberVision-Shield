import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import scanRoutes from './routes/scan.js';
import incidentRoutes from './routes/incidents.js';
import trackerRoutes from './routes/tracker.js';

// Create Express App (shared by the standalone server and the Netlify Function)
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all headers for testing/dev ease
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make sure the database is connected before routes that need it
const ensureDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    res.status(503).json({ error: 'Database unavailable. Check the MONGODB_URI setting.' });
  }
};

// Routing Prefixes
const api = express.Router();
api.use('/scan', scanRoutes);
api.use('/incidents', ensureDB, incidentRoutes);
api.use('/tracker', ensureDB, trackerRoutes);

app.use('/api', api);
// Netlify may pass the function path instead of the original /api path
app.use('/.netlify/functions/api', api);

export default app;
