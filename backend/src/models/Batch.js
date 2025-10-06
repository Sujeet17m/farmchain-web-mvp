const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Batch = sequelize.define('Batch', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  farmerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  produceType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'kg'
  },
  harvestDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  farmingMethod: {
    type: DataTypes.ENUM('organic', 'conventional', 'regenerative'),
    defaultValue: 'conventional'
  },
  voiceNoteUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  transcription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  qrCode: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  blockchainHash: {
    type: DataTypes.STRING,
    allowNull: true
  },
  qualityScore: {
    type: DataTypes.DECIMAL(3, 1),
    defaultValue: 0.0
  },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'in_transit', 'delivered', 'completed'),
    defaultValue: 'pending'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  tableName: 'batches',
  timestamps: true
});

module.exports = Batch;