const { Sequelize } = require('sequelize');
require('dotenv').config ();

let sequelize;
let isMock = false;

// Support both standard DB_ vars and Vercel/TiDB specific TIDB_ vars
const DB_HOST = process.env.DB_HOST || process.env.TIDB_HOST;
const DB_NAME = process.env.DB_NAME || process.env.TIDB_DATABASE;
const DB_USER = process.env.DB_USER || process.env.TIDB_USER;
const DB_PASS = process.env.DB_PASS || process.env.TIDB_PASSWORD;
const DB_PORT = process.env.DB_PORT || process.env.TIDB_PORT || 3306;

if (DB_HOST && DB_NAME && DB_USER) {
  sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASS,
    {
      host: DB_HOST,
      port: DB_PORT,
      dialect: 'mysql',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: console.log, // Enable logging to see connection errors
    }
  );
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
module.exports = sequelize;
