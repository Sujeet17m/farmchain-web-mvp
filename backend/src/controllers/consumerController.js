const { Batch, User, Verification, Event } = require('../models');

// Track product by batch ID
exports.trackProduct = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await Batch.findByPk(batchId, {
      include: [
        {
          model: User,
          as: 'farmer',
          attributes: ['id', 'name', 'email', 'phone', 'reputation', 'location']
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
          ],
          order: [['createdAt', 'DESC']]
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

    // Calculate verification statistics
    const verificationStats = {
      count: batch.verifications.length,
      avgScore: batch.qualityScore,
      consensusReached: batch.verifications.length >= 3,
      scores: batch.verifications.map(v => v.score)
    };

    // Get blockchain verification if available
    let blockchainData = null;
    if (batch.blockchainHash && process.env.CONTRACT_ADDRESS) {
      const blockchainService = require('../services/blockchainService');
      blockchainData = await blockchainService.getBatch(batch.id)
        .catch(err => {
          console.error('Blockchain fetch error:', err);
          return null;
        });
    }

    res.json({
      batch: {
        ...batch.toJSON(),
        verificationStats,
        blockchainData
      }
    });
  } catch (error) {
    console.error('Track product error:', error);
    res.status(500).json({ error: 'Failed to track product' });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { 
      produceType, 
      farmingMethod, 
      minQualityScore, 
      status,
      page = 1,
      limit = 12
    } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (produceType) {
      where.produceType = { [require('sequelize').Op.iLike]: `%${produceType}%` };
    }
    if (farmingMethod) {
      where.farmingMethod = farmingMethod;
    }
    if (minQualityScore) {
      where.qualityScore = { [require('sequelize').Op.gte]: parseFloat(minQualityScore) };
    }
    if (status) {
      where.status = status;
    } else {
      // Default to verified batches for consumers
      where.status = { [require('sequelize').Op.in]: ['verified', 'in_transit', 'delivered'] };
    }

    const { count, rows: batches } = await Batch.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'farmer',
          attributes: ['id', 'name', 'reputation', 'location']
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
    console.error('Search products error:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const batches = await Batch.findAll({
      where: {
        status: 'verified',
        qualityScore: { [require('sequelize').Op.gte]: 8 }
      },
      include: [
        {
          model: User,
          as: 'farmer',
          attributes: ['id', 'name', 'reputation']
        }
      ],
      order: [['qualityScore', 'DESC'], ['createdAt', 'DESC']],
      limit: 6
    });

    res.json({ batches });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ error: 'Failed to get featured products' });
  }
};

// Get product categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Batch.findAll({
      attributes: [
        'produceType',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      where: {
        status: { [require('sequelize').Op.in]: ['verified', 'in_transit', 'delivered'] }
      },
      group: ['produceType'],
      order: [[require('sequelize').literal('count'), 'DESC']],
      raw: true
    });

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
};