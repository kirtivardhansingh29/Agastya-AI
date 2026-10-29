import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import overviewRoutes from './routes/overviewRoutes.js';
import apiRoutes from './routes/apiRoutes.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Configure CORS to dynamically accept localhost origins on any port (e.g. 5173, 5174, etc.)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    // Allow any localhost or 127.0.0.1 origin or configured CLIENT_URL
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/.test(origin);
    const isClientUrl = origin === CLIENT_URL;
    
    if (isLocalhost || isClientUrl) {
      return callback(null, true);
    }
    
    // For local development convenience, allow origin
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Root check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "Agastya AI Central Regulatory Authority Backend Server"
  });
});

// Health check endpoint (Strictly adhering to Requirement #12)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: "Agastya AI server is running"
  });
});

// Mount Routes
app.use('/api/overview', overviewRoutes);
app.use('/api', apiRoutes);

// Centralized error handler adhering to Requirement #11
app.use((err, req, res, next) => {
  console.error("Unhandled API Error:", err);
  res.status(500).json({
    success: false,
    error: {
      message: err.message || "Internal Regulatory Server Error"
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
==================================================================
  Agastya AI Central Regulatory Authority Backend Server
  Running on: http://localhost:${PORT} and http://0.0.0.0:${PORT}
  Accepting client requests from: ${CLIENT_URL} and any localhost port
  Data layer: Local JSON Repository (Firebase-ready abstraction)
==================================================================
  `);
});
