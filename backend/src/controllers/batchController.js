const { Batch, User, Verification, Event } = require('../models');
const QRCode = require('qrcode');
const { Op } = require('sequelize');

// Create new batch
exports.createBatch = async (req, res) => {
  try {
    const {
      produceType,
      quantity,
      unit,
      harvestDate,
      farmingMethod,
      transcription,
      price
    } = req.body;

    // Handle file uploads
    const voiceNoteUrl = req.files?.voice?.[0]?.path;
    const images = req.files?.images?.map(file => file.path) || [];

    // Create batch
    const batch = await Batch.create({
      farmerId: req.user.id,
      produceType,
      quantity,
      unit: unit || 'kg',
      harvestDate: harvestDate || new Date(),
      farmingMethod: farmingMethod || 'conventional',
      voiceNoteUrl,
      transcription,
      images,
      price
    });

    // Generate QR code
    const qrData = JSON.stringify({
      batchId: batch.id,
      type: 'farmchain',
      url: `${process.env.API_URL}/api/consumer/track/${batch.id}`
    });

    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      width: 400,
      margin: 2,
      color: {
        dark: '#2e7d32',
        light: '#ffffff'
      }
    });

    await batch.update({ qrCode: qrCodeDataURL });

    // Create event
    await Event.create({
      batchId: batch.id,
      eventType: 'created',
      description: `Batch created by ${req.user.name}`,
      metadata: { quantity, unit, produceType }
    });

    // Trigger blockchain recording (async)
    if (process.env.CONTRACT_ADDRESS) {
      const blockchainService = require('../services/blockchainService');
      blockchainService.recordBatch(batch.id, produceType, quantity)
        .then(result => {
          if (result.success) {
            batch.update({ blockchainHash: result.txHash });
          }
        })
        .catch(err => console.error('Blockchain recording error:', err));
    }

    res.status(201).json({
      message: 'Batch created successfully',
      batch: {
        id: batch.id,
        produceType: batch.produceType,
        quantity: batch.quantity,
        unit: batch.unit,
        qrCode: batch.qrCode,
        status: batch.status,
        createdAt: batch.createdAt
      }
    });
  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({ error: 'Failed to create batch' });
  }
};

// Get farmer's batches
exports.getFarmerBatches = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = { farmerId: req.user.id };
    if (status) where.status = status;

    const { count, rows: batches } = await Batch.findAndCountAll({
      where,
      include: [
        {
          model: Verification,
          as: 'verifications',
          attributes: ['id', 'score', 'createdAt']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      batches,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({ error: 'Failed to get batches' });
  }
};

// Get batch details
exports.getBatchDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await Batch.findByPk(id, {
      include: [
        {
          model: User,
          as: 'farmer',
          attributes: ['id', 'name', 'email', 'phone', 'reputation']
        },
        {
          model: Verification,
          as: 'verifications',
          include: [
            {
              model: User,
              as: 'verifier',
              attributes: ['id', 'name', 'reputation']
            }
          ]
        },
        {
          model: Event,
          as: 'events',
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    res.json({ batch });
  } catch (error) {
    console.error('Get batch details error:', error);
    res.status(500).json({ error: 'Failed to get batch details' });
  }
};

// Update batch
exports.updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, status } = req.body;

    const batch = await Batch.findOne({
      where: { id, farmerId: req.user.id }
    });

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found or unauthorized' });
    }

    await batch.update({
      price: price !== undefined ? price : batch.price,
      status: status || batch.status
    });

    // Create event for status change
    if (status && status !== batch.status) {
      await Event.create({
        batchId: batch.id,
        eventType: status,
        description: `Status changed to ${status}`
      });
    }

    res.json({
      message: 'Batch updated successfully',
      batch
    });
  } catch (error) {
    console.error('Update batch error:', error);
    res.status(500).json({ error: 'Failed to update batch' });
  }
};

// Delete batch
exports.deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await Batch.findOne({
      where: { id, farmerId: req.user.id }
    });

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found or unauthorized' });
    }

    // Only allow deletion if no verifications
    const verificationCount = await Verification.count({ where: { batchId: id } });
    if (verificationCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete batch with existing verifications' 
      });
    }

    await batch.destroy();

    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({ error: 'Failed to delete batch' });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalBatches = await Batch.count({
      where: { farmerId: req.user.id }
    });

    const verifiedBatches = await Batch.count({
      where: {
        farmerId: req.user.id,
        status: 'verified'
      }
    });

    const avgQualityScore = await Batch.findOne({
      where: {
        farmerId: req.user.id,
        qualityScore: { [Op.gt]: 0 }
      },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('qualityScore')), 'avgScore']
      ],
      raw: true
    });

    const totalEarnings = await Batch.sum('price', {
      where: {
        farmerId: req.user.id,
        status: 'completed'
      }
    });

    res.json({
      stats: {
        totalBatches,
        verifiedBatches,
        avgQualityScore: parseFloat(avgQualityScore?.avgScore || 0),
        totalEarnings: parseFloat(totalEarnings || 0),
        reputation: req.user.reputation
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
};