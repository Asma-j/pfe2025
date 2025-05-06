const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const QuizQuestion = sequelize.define('QuizQuestion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  quiz_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  options: {
    type: DataTypes.JSON, // or DataTypes.STRING if your DB doesn't support JSON
    allowNull: false,
    get() {
      const value = this.getDataValue('options');
      return typeof value === 'string' ? JSON.parse(value) : value;
    },
    set(value) {
      this.setDataValue('options', JSON.stringify(value));
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = QuizQuestion;