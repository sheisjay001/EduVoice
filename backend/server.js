require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// app.use(helmet()); // Temporarily disabled for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});
app.use(cors({
  origin: '*', // Allow all origins for now (adjust for production)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Edu-Voice API', status: 'Running' });
});

// Database Connection & Server Start
const startServer = async () => {
  try {
    // Authenticate with TiDB
    await sequelize.authenticate();
    console.log('TiDB/MySQL Connected Successfully.');

    // Sync Models (Create tables if not exist)
    await sequelize.sync();
    console.log('Database Synced.');
  } catch (error) {
    console.error('Unable to connect to the database (Running in Offline Mode):', error.message);
  }

  // Start Server regardless of DB status
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Email User configured: ${process.env.EMAIL_USER ? 'Yes' : 'No'}`);
    console.log(`DB Host: ${process.env.DB_HOST}`);
  });
};

// Only start server if run directly (Local Development)
if (require.main === module) {
  startServer();
}

// Export app for Vercel
module.exports = app;
