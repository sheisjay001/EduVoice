const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2'); // Explicit require to force bundling
const path = require('path');

// Try loading .env from root (default) and backend/
require('dotenv').config(); 
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let sequelize;
let isMock = false;
let missingVars = [];

// DEBUG: Log loaded environment variables (masked)
const mask = (str) => str ? (str.length > 5 ? '***' + str.slice(-5) : '***') : 'UNDEFINED';
console.log("🔍 [DB Config] Checking Environment Variables...");
console.log(`- DB_HOST: ${mask(process.env.DB_HOST)}`);
console.log(`- TIDB_HOST: ${mask(process.env.TIDB_HOST)}`);
console.log(`- DB_USER: ${mask(process.env.DB_USER)}`);
console.log(`- TIDB_USER: ${mask(process.env.TIDB_USER)}`);
console.log(`- DB_NAME: ${mask(process.env.DB_NAME)}`);
console.log(`- TIDB_DATABASE: ${mask(process.env.TIDB_DATABASE)}`);

// Support both standard DB_ vars and Vercel/TiDB specific TIDB_ vars
// Default to XAMPP settings if missing (Localhost fallback)
const DB_HOST = process.env.DB_HOST || process.env.TIDB_HOST || 'localhost';
const DB_NAME = process.env.DB_NAME || process.env.TIDB_DATABASE || 'edu_voice';
const DB_USER = process.env.DB_USER || process.env.TIDB_USER || 'root';
const DB_PASS = process.env.DB_PASS !== undefined ? process.env.DB_PASS : (process.env.TIDB_PASSWORD !== undefined ? process.env.TIDB_PASSWORD : '');
const DB_PORT = process.env.DB_PORT || process.env.TIDB_PORT || 3306;

// No missing vars check needed as we have defaults

if (missingVars.length === 0) {
  try {
    sequelize = new Sequelize(
      DB_NAME,
      DB_USER,
      DB_PASS,
      {
        host: DB_HOST,
        port: DB_PORT,
        dialect: 'mysql',
        dialectModule: mysql2, // Fix for Vercel/Webpack not bundling mysql2
        dialectOptions: {
          connectTimeout: 10000, // 10 seconds timeout
          ...(DB_HOST !== 'localhost' && DB_HOST !== '127.0.0.1' ? {
            ssl: {
              require: true,
              rejectUnauthorized: false
            }
          } : {})
        },
        pool: {
          max: 5,
          min: 0,
          acquire: 10000, // Fail after 10 seconds of trying to get connection
          idle: 5000
        },
        logging: console.log, // Enable logging to see connection errors
      }
    );
  } catch (err) {
    console.error("❌ Sequelize Init Failed:", err.message);
    isMock = true;
    sequelize = {
      initError: err.message, // Capture the initialization error
      authenticate: async () => console.log("⚠️  Mock DB Authenticated"),
      sync: async () => console.log("⚠️  Mock DB Synced"),
      define: (name, schema) => {
        return {
          name,
          schema,
          findOne: async () => null,
          create: async () => ({}),
          save: async () => {},
        };
      }
    };
  }
} else {
  console.warn("⚠️  Missing Database Env Vars. Using Mock Sequelize (Offline Mode).");
  isMock = true;
  // Create a Mock Sequelize instance to prevent crashes
  sequelize = {
    authenticate: async () => console.log("⚠️  Mock DB Authenticated"),
    sync: async () => console.log("⚠️  Mock DB Synced"),
    define: (name, schema) => {
      return {
        name,
        schema,
        findOne: async () => null,
        create: async () => ({}),
        save: async () => {},
      };
    }
  };
}

// Export both the instance and the isMock flag
sequelize.isMock = isMock;
sequelize.missingVars = missingVars;
module.exports = sequelize;
