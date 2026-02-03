const sequelize = require('../config/database');

async function forceAddColumns() {
  try {
    console.log("🚀 Connectng to DB...");
    await sequelize.authenticate();
    console.log("✅ Connected.");

    console.log("🔍 Checking columns...");
    const [results] = await sequelize.query("SHOW COLUMNS FROM Reports");
    const columns = results.map(c => c.Field);
    console.log("Existing columns:", columns);

    if (!columns.includes('viewed')) {
      console.log("⚠️ 'viewed' column missing. Adding...");
      await sequelize.query("ALTER TABLE Reports ADD COLUMN viewed TINYINT(1) DEFAULT 0");
      console.log("✅ 'viewed' added.");
    } else {
      console.log("✅ 'viewed' column already exists.");
    }

    if (!columns.includes('forwarded')) {
      console.log("⚠️ 'forwarded' column missing. Adding...");
      await sequelize.query("ALTER TABLE Reports ADD COLUMN forwarded TINYINT(1) DEFAULT 0");
      console.log("✅ 'forwarded' added.");
    } else {
      console.log("✅ 'forwarded' column already exists.");
    }

    console.log("🎉 Done.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

forceAddColumns();
