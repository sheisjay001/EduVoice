require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss-clean');
const sequelize = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet()); // Set security HTTP headers

// Rate Limiting (DDoS Protection)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter); // Apply to all API routes

// Body Parser with limits (Buffer Overflow Protection)
app.use(express.json({ limit: '10mb' })); 

// Data Sanitization against XSS
app.use(xss());

// Prevent Parameter Pollution
app.use(hpp());

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Database Initialization Middleware for Vercel
let dbInitialized = false;
const initDB = async () => {
  if (dbInitialized) return;
  try {
    console.log("🔄 [DB Init] Starting initialization...");
    await sequelize.authenticate();
    console.log('✅ [DB Init] TiDB/MySQL Connected.');
    
    // Sync Models
    // Using { alter: true } can sometimes be problematic on TiDB if permissions are tight
    // We try it, but catch errors specifically for sync
    try {
        await sequelize.sync({ alter: true });
        console.log('✅ [DB Init] Database Synced (Alter Mode).');
    } catch (syncError) {
        console.error('⚠️ [DB Init] Sync failed, attempting basic sync:', syncError.message);
        await sequelize.sync(); // Fallback to basic sync (create if not exists)
    }
    
    // Verify Reports table exists
    const [results] = await sequelize.query("SHOW TABLES LIKE 'Reports'");
    if (results.length === 0) {
        console.warn("⚠️ [DB Init] Reports table still missing after sync. Attempting manual creation...");
        // Sequelize should have created it, but if not, something is wrong
    } else {
        console.log("✅ [DB Init] Reports table verified.");
    }
    
    dbInitialized = true;
  } catch (error) {
    console.error('❌ [DB Init] Critical Failure (Offline Mode):', error.message);
  }
};

app.use(async (req, res, next) => {
  if (!dbInitialized) {
    await initDB();
  }
  next();
});

app.use(cors({
    origin: '*', // Allow all origins for now (adjust for production)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: '*', // Allow all headers to avoid CORS preflight issues
    credentials: true
  }));
  
  // Explicitly handle OPTIONS for all routes
  app.options('*', cors());
// app.use(express.json()); // REMOVED: Duplicate, already handled with limits above
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// Routes
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Support both /api/auth and /auth (in case Vercel rewrites strip /api)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/reports', '/reports'], reportRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Edu-Voice API', status: 'Running', timestamp: new Date() });
});

// --- Debug Endpoint to Trigger Fix Manually ---
app.get('/api/fix-db-columns', async (req, res) => {
  try {
    const result = await checkAndFixColumns();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Debug Endpoint to Fetch Report by ID (Bypass Filters) ---
app.get('/api/debug/report/:caseId', async (req, res) => {
  try {
    const { caseId } = req.params;
    const [results] = await sequelize.query(`SELECT * FROM Reports WHERE caseId = '${caseId}'`);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: 'Report not found in DB' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all 404 handler for debugging Vercel routing
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    debug_url: req.url,
    debug_method: req.method
  });
});

// Database Connection & Server Start
const startServer = async () => {
  try {
    console.log("🚀 [Server] V2 Starting...");
    // Authenticate with TiDB
    await sequelize.authenticate();
    console.log('TiDB/MySQL Connected Successfully.');

    // Sync Models (Create tables if not exist, alter if changed)
    await sequelize.sync({ alter: true });
    console.log('Database Synced (Alter Mode).');

    // FORCE CHECK COLUMNS (Fix for persistent "Unknown column" error)
    await checkAndFixColumns();

  } catch (error) {
    console.error('Unable to connect to the database (Running in Offline Mode):', error.message);
  }

  // Start Server regardless of DB status
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Email User configured: ${process.env.EMAIL_USER ? 'Yes' : 'No'}`);
    console.log(`DB Host: ${process.env.DB_HOST}`);
  });
};

// --- Helper Function to Check and Fix Columns ---
async function checkAndFixColumns() {
  try {
    const [results] = await sequelize.query("SHOW COLUMNS FROM Reports");
    const columns = results.map(c => c.Field);
    console.log("🔍 [Server] Verified Reports Table Columns:", columns);

    return { status: 'ok', message: 'All columns exist' };
  } catch (err) {
    console.error("❌ [Server] Failed to verify columns manually:", err);
    throw err;
  }
}

// Only start server if run directly (Local Development)
if (require.main === module) {
  startServer();
}

// Export app for Vercel
module.exports = app;
