const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admin = sequelize.define('Admin', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  institution: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('admin', 'superadmin'),
    defaultValue: 'admin'
  },
  addedBy: {
    type: DataTypes.STRING,
    defaultValue: 'System'
  }
});

module.exports = Admin;
