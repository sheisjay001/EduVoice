const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' }); // Adjust path if needed

async function check() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'edu_voice'
  };

  console.log('🔌 Connecting with config:', { ...config, password: '***' });

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected!');

    console.log('🔍 Checking tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📂 Tables:', tables);

    console.log('🔍 Checking columns in "Reports"...');
    const [columns] = await connection.execute('SHOW COLUMNS FROM Reports');
    const columnNames = columns.map(c => c.Field);
    console.log('📋 Columns:', columnNames);

    if (columnNames.includes('viewed')) {
        console.log('✅ Column "viewed" FOUND in raw SQL check.');
    } else {
        console.error('❌ Column "viewed" NOT FOUND in raw SQL check.');
    }

    await connection.end();
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

check();
