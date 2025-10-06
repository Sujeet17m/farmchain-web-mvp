const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/pending', auth, authorize('verifier'), verificationController.getPendingBatches);
router.post(
  '/',
  auth,
  authorize('verifier'),
  upload.fields([{ name: 'images', maxCount: 3 }]),
  verificationController.submitVerification
);
router.get('/history', auth, authorize('verifier'), verificationController.getVerificationHistory);
router.get('/stats', auth, authorize('verifier'), verificationController.getVerifierStats);

module.exports = router;