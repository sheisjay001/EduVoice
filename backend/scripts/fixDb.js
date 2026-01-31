const sequelize = require('../config/database');
const Report = require('../models/Report');

const fixDb = async () => {
  try {
    console.log('🔍 Authenticating with Database...');
    await sequelize.authenticate();
    console.log('✅ Connected to Database.');

    console.log('🔄 Syncing Report model (Alter Table)...');
    await Report.sync({ alter: true });
    console.log('✅ Report table synced successfully. Missing columns should be added.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing DB:', error);
    process.exit(1);
  }
};

fixDb();
