const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class VoiceService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.enabled = !!this.apiKey;
    
    if (!this.enabled) {
      console.warn('⚠️  OpenAI API key not configured. Voice transcription disabled.');
    }
  }

  async transcribe(audioFilePath, language = 'en') {
    if (!this.enabled) {
      return { success: false, error: 'Voice service not configured' };
    }

    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(audioFilePath));
      formData.append('model', 'whisper-1');
      if (language) {
        formData.append('language', language);
      }

      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            ...formData.getHeaders()
          }
        }
      );

      return {
        success: true,
        transcription: response.data.text
      };
    } catch (error) {
      console.error('Transcription error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async extractProduceInfo(transcription) {
    if (!this.enabled) {
      return null;
    }

    try {
      const prompt = `Extract structured information from this farmer's description:
"${transcription}"

Return JSON with these fields (use null if not mentioned):
{
  "produceType": "type of produce",
  "quantity": number,
  "unit": "kg/tons/pounds",
  "farmingMethod": "organic/conventional/regenerative",
  "qualityNotes": "any quality mentions"
}`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that extracts structured data.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return null;
    } catch (error) {
      console.error('Extraction error:', error);
      return null;
    }
  }
}

module.exports = new VoiceService();