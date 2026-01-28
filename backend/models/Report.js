const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const crypto = require('crypto');

const Report = sequelize.define('Report', {
  caseId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    defaultValue: () => crypto.randomBytes(4).toString('hex').toUpperCase()
  },
  faculty: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  courseCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  encryptedOffender: {
    type: DataTypes.TEXT, // Use TEXT for long encrypted strings
    allowNull: false,
  },
  encryptedDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  evidence: {
    type: DataTypes.JSON, // Array of file paths
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Investigating', 'Resolved', 'Dismissed'),
    defaultValue: 'Pending',
  }
});

module.exports = Report;
