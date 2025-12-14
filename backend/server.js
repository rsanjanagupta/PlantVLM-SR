// backend/server.js (updated)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// routes and middleware
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const FLASK_URL = process.env.FLASK_URL || 'http://127.0.0.1:5000/analyze';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';
const ALLOW_PUBLIC_UPLOADS = String(process.env.ALLOW_PUBLIC_UPLOADS || 'false').toLowerCase() === 'true';

// Basic validation for required envs
if (!process.env.MONGO_URI) {
  console.error('FATAL: MONGO_URI is not set in .env. Please set MONGO_URI and restart the server.');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set. For production use a long random secret in .env');
}

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: FRONTEND_ORIGIN }));

// Serve uploaded files (optional)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public routes
app.use('/auth', authRoutes);

// Upload route wiring:
// If ALLOW_PUBLIC_UPLOADS=true then the upload route will be public (no auth).
// Otherwise the route is protected with authMiddleware.
if (ALLOW_PUBLIC_UPLOADS) {
  console.log('Upload route configured as PUBLIC (ALLOW_PUBLIC_UPLOADS=true)');
  app.use('/', uploadRoutes);
} else {
  console.log('Upload route configured as PROTECTED (requires Authorization header)');
  app.use('/', authMiddleware, uploadRoutes);
}

// Health endpoint
app.get('/health', (req, res) => res.json({
  status: 'ok',
  node: true,
  flask: FLASK_URL,
  db: !!process.env.MONGO_URI
}));

// Connect DB then start server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  console.log(`FLASK_URL = ${FLASK_URL}`);
  console.log(`FRONTEND_ORIGIN = ${FRONTEND_ORIGIN}`);
  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT} -> forwarding to ${FLASK_URL}`);
  });
}).catch(err => {
  console.error('MongoDB connection error:', (err && err.message) || err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('SIGINT received — shutting down gracefully');
  mongoose.disconnect().finally(() => process.exit(0));
});
process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully');
  mongoose.disconnect().finally(() => process.exit(0));
});
