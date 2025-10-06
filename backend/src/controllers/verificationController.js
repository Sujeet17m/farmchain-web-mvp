const { Verification, Batch, User, Event } = require('../models');
const { Op } = require('sequelize');

// Get pending batches for verification
exports.getPendingBatches = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get batches that need verification (less than 3 verifications)
    const batches = await Batch.findAll({
      where: {
        status: 'pending',
        farmerId: { [Op.ne]: req.user.id } // Exclude own batches
      },
      include: [
        {
          model: User,
          as: 'farmer',
          attributes: ['id', 'name', 'reputation']
        },
        {
          model: Verification,
          as: 'verifications',
          attributes: ['id']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'ASC']]
    });

    // Filter batches with less than 3 verifications
    const filteredBatches = batches.filter(batch => {
      return batch.verifications.length < 3;
    });

    // Check if user already verified these batches
    const batchesWithUserVerification = await Promise.all(
      filteredBatches.map(async (batch) => {
        const userVerification = await Verification.findOne({
          where: {
            batchId: batch.id,
            verifierId: req.user.id
          }
        });

        return {
          ...batch.toJSON(),
          userHasVerified: !!userVerification,
          verificationCount: batch.verifications.length
        };
      })
    );

    // Filter out batches already verified by user
    const availableBatches = batchesWithUserVerification.filter(
      batch => !batch.userHasVerified
    );

    res.json({
      batches: availableBatches,
      count: availableBatches.length
    });
  } catch (error) {
    console.error('Get pending batches error:', error);
    res.status(500).json({ error: 'Failed to get pending batches' });
  }
};

// Submit verification
exports.submitVerification = async (req, res) => {
  try {
    const { batchId, score, notes, confidence } = req.body;

    // Validate score
    if (!score || score < 1 || score > 10) {
      return res.status(400).json({ error: 'Score must be between 1 and 10' });
    }

    // Check if batch exists
    const batch = await Batch.findByPk(batchId);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Check if user is the farmer
    if (batch.farmerId === req.user.id) {
      return res.status(400).json({ error: 'Cannot verify own batch' });
    }

    // Check if already verified by this user
    const existingVerification = await Verification.findOne({
      where: { batchId, verifierId: req.user.id }
    });

    if (existingVerification) {
      return res.status(400).json({ error: 'Already verified this batch' });
    }

    // Handle image uploads
    const images = req.files?.images?.map(file => file.path) || [];

    // Create verification
    const verification = await Verification.create({
      batchId,
      verifierId: req.user.id,
      score: parseInt(score),
      notes,
      images,
      confidence: confidence || 0.80
    });

    // Get all verifications for this batch
    const verifications = await Verification.findAll({
      where: { batchId },
      include: [
        {
          model: User,
          as: 'verifier',
          attributes: ['reputation']
        }
      ]
    });

    // Calculate consensus if we have 3 or more verifications
    if (verifications.length >= 3) {
      let totalWeightedScore = 0;
      let totalWeight = 0;

      verifications.forEach(v => {
        const weight = (parseFloat(v.verifier.reputation) / 10) * parseFloat(v.confidence);
        totalWeightedScore += v.score * weight;
        totalWeight += weight;
      });

      const avgQualityScore = totalWeight > 0 
        ? totalWeightedScore / totalWeight 
        : verifications.reduce((sum, v) => sum + v.score, 0) / verifications.length;

      // Update batch
      await batch.update({
        qualityScore: avgQualityScore,
        status: 'verified'
      });

      // Create event
      await Event.create({
        batchId: batch.id,
        eventType: 'verified',
        description: `Batch verified with quality score ${avgQualityScore.toFixed(1)}/10`,
        metadata: { 
          qualityScore: avgQualityScore,
          verificationCount: verifications.length 
        }
      });

      // Update verifier reputation
      await req.user.update({
        reputation: Math.min(10, parseFloat(req.user.reputation) + 0.1)
      });

      // Trigger blockchain verification recording
      if (process.env.CONTRACT_ADDRESS) {
        const blockchainService = require('../services/blockchainService');
        blockchainService.verifyBatch(batch.id, Math.round(avgQualityScore))
          .catch(err => console.error('Blockchain verification error:', err));
      }
    }

    res.status(201).json({
      message: 'Verification submitted successfully',
      verification,
      consensusReached: verifications.length >= 3,
      totalVerifications: verifications.length
    });
  } catch (error) {
    console.error('Submit verification error:', error);
    res.status(500).json({ error: 'Failed to submit verification' });
  }
};

// Get verifier's verification history
exports.getVerificationHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: verifications } = await Verification.findAndCountAll({
      where: { verifierId: req.user.id },
      include: [
        {
          model: Batch,
          as: 'batch',
          include: [
            {
              model: User,
              as: 'farmer',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      verifications,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get verification history error:', error);
    res.status(500).json({ error: 'Failed to get verification history' });
  }
};

// Get verifier dashboard stats
exports.getVerifierStats = async (req, res) => {
  try {
    const totalVerifications = await Verification.count({
      where: { verifierId: req.user.id }
    });

    const avgScore = await Verification.findOne({
      where: { verifierId: req.user.id },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('score')), 'avgScore']
      ],
      raw: true
    });

    const recentVerifications = await Verification.findAll({
      where: { verifierId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [
        {
          model: Batch,
          as: 'batch',
          attributes: ['id', 'produceType', 'status']
        }
      ]
    });

    res.json({
      stats: {
        totalVerifications,
        avgScore: parseFloat(avgScore?.avgScore || 0),
        reputation: req.user.reputation,
        recentVerifications
      }
    });
  } catch (error) {
    console.error('Get verifier stats error:', error);
    res.status(500).json({ error: 'Failed to get verifier stats' });
  }
};