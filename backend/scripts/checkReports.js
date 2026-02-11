const sequelize = require('../config/database');
const Report = require('../models/Report');

async function checkReports() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        // Raw Query to bypass model definition issues
        const [results, metadata] = await sequelize.query("SELECT * FROM Reports");
        console.log(`📊 Found ${results.length} reports in the 'Reports' table (Raw SQL).`);
        
        if (results.length > 0) {
            console.log('--- First 3 Reports ---');
            results.slice(0, 3).forEach(r => {
                console.log(`ID: ${r.id}, CaseID: ${r.caseId}, Inst: ${r.institution}, Created: ${r.createdAt}`);
            });
        }

        // Sequelize FindAll
        try {
            const reports = await Report.findAll();
            console.log(`✅ Sequelize found ${reports.length} reports.`);
        } catch (err) {
            console.error('❌ Sequelize Model FindAll Failed:', err.message);
        }

    } catch (error) {
        console.error('❌ Database connection failed:', error);
    } finally {
        await sequelize.close();
    }
}

checkReports();
