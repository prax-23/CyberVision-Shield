import serverless from 'serverless-http';
import app from '../../backend/app.js';

// Runs the Express API as a Netlify Function (requests to /api/* are redirected here)
export const handler = serverless(app, {
  binary: ['image/*'],
});
