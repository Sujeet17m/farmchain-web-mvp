const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const voiceService = require('../services/voiceService');

router.post('/transcribe', auth, upload.single('voice'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { language = 'en' } = req.body;
    
    const transcriptionResult = await voiceService.transcribe(req.file.path, language);
    
    if (!transcriptionResult.success) {
      return res.status(500).json({ error: 'Transcription failed' });
    }

    // Extract structured data
    const extractedData = await voiceService.extractProduceInfo(transcriptionResult.transcription);

    res.json({
      transcription: transcriptionResult.transcription,
      extractedData,
      audioUrl: `/uploads/voice/${req.file.filename}`
    });
  } catch (error) {
    console.error('Voice transcription error:', error);
    res.status(500).json({ error: 'Failed to process voice note' });
  }
});

module.exports = router;