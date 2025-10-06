const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  batchId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'batches',
      key: 'id'
    }
  },
  eventType: {
    type: DataTypes.ENUM(
      'created', 
      'verified', 
      'packaged', 
      'in_transit', 
      'warehouse', 
      'retail', 
      'delivered'
    ),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'events',
  timestamps: true
});

module.exports = Event;