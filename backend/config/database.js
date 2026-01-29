const { Sequelize } = require('sequelize');
require('dotenv').config();

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
const DB_HOST = process.env.DB_HOST || process.env.TIDB_HOST;
const DB_NAME = process.env.DB_NAME || process.env.TIDB_DATABASE;
const DB_USER = process.env.DB_USER || process.env.TIDB_USER;
const DB_PASS = process.env.DB_PASS || process.env.TIDB_PASSWORD;
const DB_PORT = process.env.DB_PORT || process.env.TIDB_PORT || 3306;

if (!DB_HOST) missingVars.push('DB_HOST or TIDB_HOST');
if (!DB_NAME) missingVars.push('DB_NAME or TIDB_DATABASE');
if (!DB_USER) missingVars.push('DB_USER or TIDB_USER');

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
        dialectOptions: {
          connectTimeout: 10000, // 10 seconds timeout
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
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
