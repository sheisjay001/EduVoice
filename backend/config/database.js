const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER) {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'mysql',
      dialectOptions: process.env.DB_HOST.includes('tidbcloud') ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {},
      logging: false,
    }
  );
} else {
  console.warn("⚠️  Missing Database Env Vars. Using Mock Sequelize (Offline Mode).");
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

module.exports = sequelize;
