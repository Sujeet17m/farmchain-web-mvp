const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Farmer routes
router.post(
  '/',
  auth,
  authorize('farmer'),
  upload.fields([
    { name: 'voice', maxCount: 1 },
    { name: 'images', maxCount: 5 }
  ]),
  batchController.createBatch
);

router.get('/my-batches', auth, authorize('farmer'), batchController.getFarmerBatches);
router.get('/dashboard-stats', auth, authorize('farmer'), batchController.getDashboardStats);
router.get('/:id', auth, batchController.getBatchDetails);
router.put('/:id', auth, authorize('farmer'), batchController.updateBatch);
router.delete('/:id', auth, authorize('farmer'), batchController.deleteBatch);

module.exports = router;