const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Otp = sequelize.define('Otp', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Sequelize automatically handles createdAt and updatedAt
  // But we want to simulate the TTL (Time To Live) behavior of MongoDB
  // We will need a scheduled job or check expiry on read
  expiresAt: {
    type: DataTypes.DATE,
    defaultValue: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
  }
});

module.exports = Otp;
