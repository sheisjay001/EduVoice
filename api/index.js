const app = require('../backend/server.js');
const sequelize = require('../backend/config/database');

// Cache the connection
let isConnected = false;

module.exports = async (req, res) => {
  // Ensure DB is connected (if possible) before handling request
  if (!isConnected) {
    try {
      await sequelize.authenticate();
      // Only sync if necessary, or rely on manual migration. 
      // For now, we skip sync() to avoid slowing down every cold start, 
      // or assume tables exist. 
      // If you need auto-create tables on Vercel, uncomment next line:
      // await sequelize.sync(); 
      console.log('TiDB/MySQL Connected Successfully (Vercel).');
      isConnected = true;
    } catch (error) {
      console.warn('Unable to connect to the database (Running in Offline Mode):', error.message);
      // We don't throw here, allowing the app to proceed in "Offline Mode"
    }
  }
  
  // Forward request to Express app
  return app(req, res);
};