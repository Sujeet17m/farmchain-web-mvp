const User = require('./User');
const Batch = require('./Batch');
const Verification = require('./Verification');
const Event = require('./Event');

// Define relationships
User.hasMany(Batch, { foreignKey: 'farmerId', as: 'batches' });
Batch.belongsTo(User, { foreignKey: 'farmerId', as: 'farmer' });

Batch.hasMany(Verification, { foreignKey: 'batchId', as: 'verifications' });
Verification.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });

User.hasMany(Verification, { foreignKey: 'verifierId', as: 'verificationsGiven' });
Verification.belongsTo(User, { foreignKey: 'verifierId', as: 'verifier' });

Batch.hasMany(Event, { foreignKey: 'batchId', as: 'events' });
Event.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });

module.exports = {
  User,
  Batch,
  Verification,
  Event
};