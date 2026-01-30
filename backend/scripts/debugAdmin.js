const sequelize = require('../config/database');
const Admin = require('../models/Admin');

const inspectAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    
    const targetEmail = 'joy.m2200251@st.futminna.edu.ng';
    const admin = await Admin.findOne({ where: { email: targetEmail } });
    
    if (admin) {
      console.log(`Found Admin: '${admin.email}'`);
      console.log(`Length: ${admin.email.length}`);
      console.log('Char codes:');
      for (let i = 0; i < admin.email.length; i++) {
        console.log(`${admin.email[i]}: ${admin.email.charCodeAt(i)}`);
      }
    } else {
      console.log(`❌ Admin with email '${targetEmail}' NOT FOUND.`);
      
      // List all just in case
      const all = await Admin.findAll();
      console.log('All Admins:');
      all.forEach(a => console.log(`'${a.email}'`));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
};

inspectAdmin();
