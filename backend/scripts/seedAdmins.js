const sequelize = require('../config/database');
const Admin = require('../models/Admin');

const seedAdmins = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    
    // Sync Admin table (create if not exists)
    await Admin.sync({ alter: true });
    
    const admins = [
      { email: 'president@futminna.edu.ng', institution: 'Federal University of Technology, Minna', role: 'admin' },
      { email: 'vc@unilag.edu.ng', institution: 'University of Lagos', role: 'admin' },
      { email: 'admin@eduvoice.ng', institution: 'EduVoice HQ', role: 'superadmin' },
      { email: 'joy.m2200251@st.futminna.edu.ng', institution: 'Federal University of Technology, Minna', role: 'admin' }
    ];

    for (const admin of admins) {
      const [record, created] = await Admin.findOrCreate({
        where: { email: admin.email },
        defaults: admin
      });
      
      if (created) {
        console.log(`✅ Added: ${admin.email}`);
      } else {
        console.log(`ℹ️  Exists: ${admin.email}`);
      }
    }
    
    console.log('Admin seeding completed.');
  } catch (error) {
    console.error('Error seeding admins:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
};

seedAdmins();
