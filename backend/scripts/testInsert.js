const sequelize = require('../config/database');
const Report = require('../models/Report');

async function testInsert() {
  try {
    console.log("🚀 Connecting to DB...");
    await sequelize.authenticate();
    console.log("✅ Connected.");

    console.log("🔄 Syncing Model (alter: true)...");
    await Report.sync({ alter: true });
    console.log("✅ Synced.");

    console.log("📝 Attempting to create a dummy report...");
    const report = await Report.create({
      institution: 'Test Inst',
      faculty: 'Test Fac',
      department: 'Test Dept',
      courseCode: 'TST101',
      encryptedOffender: 'test_offender',
      encryptedDescription: 'test_desc',
      evidence: []
    });

    console.log("🎉 Success! Report created with ID:", report.caseId);

    // Clean up
    await report.destroy();
    console.log("🧹 Cleaned up test report.");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error during test insert:", error);
    process.exit(1);
  }
}

testInsert();
