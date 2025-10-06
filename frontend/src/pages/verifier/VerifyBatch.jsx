import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { batchAPI, verificationAPI } from '../../services/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const VerifyBatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    score: 7,
    notes: '',
    confidence: 0.80,
  });
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchBatchDetails();
  }, [id]);

  const fetchBatchDetails = async () => {
    try {
      const response = await batchAPI.getBatch(id);
      setBatch(response.data.batch);
    } catch (error) {
      console.error('Error fetching batch:', error);
      toast.error('Failed to load batch details');
      navigate('/verifier/pending');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('batchId', id);
      data.append('score', formData.score);
      data.append('notes', formData.notes);
      data.append('confidence', formData.confidence);

      images.forEach((image) => {
        data.append('images', image);
      });

      const response = await verificationAPI.submitVerification(data);

      toast.success('Verification submitted successfully!');
      
      if (response.data.consensusReached) {
        toast.success('Consensus reached! Batch verified.');
      }

      navigate('/verifier/dashboard');
    } catch (error) {
      console.error('Submit verification error:', error);
      toast.error(error.response?.data?.error || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 9) return 'Excellent';
    if (score >= 8) return 'Very Good';
    if (score >= 7) return 'Good';
    if (score >= 6) return 'Average';
    if (score >= 5) return 'Below Average';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/verifier/pending')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Pending
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Verify Batch</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Batch Information
          </h2>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Produce Type</p>
              <p className="text-lg font-semibold text-gray-900">
                {batch.produceType}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Quantity</p>
              <p className="text-lg font-semibold text-gray-900">
                {batch.quantity} {batch.unit}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Farming Method</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {batch.farmingMethod}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Harvest Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(batch.harvestDate).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Farmer</p>
              <p className="text-lg font-semibold text-gray-900">
                {batch.farmer.name}
              </p>
              <p className="text-sm text-gray-600">
                Reputation: {batch.farmer.reputation.toFixed(1)}/10
              </p>
            </div>
          </div>

          {/* Farmer's Voice Note */}
          {batch.transcription && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Farmer's Description:
              </p>
              <p className="text-gray-700 italic">"{batch.transcription}"</p>
              {batch.voiceNoteUrl && (
                <audio
                  controls
                  className="w-full mt-3"
                  src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${batch.voiceNoteUrl}`}
                />
              )}
            </div>
          )}

          {/* Product Images */}
          {batch.images && batch.images.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Product Images:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {batch.images.map((image, index) => (
                  <img
                    key={index}
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${image}`}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Verification Form */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Assessment
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quality Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality Score
              </label>
              <div className="text-center mb-4">
                <p className={`text-5xl font-bold ${getScoreColor(formData.score)}`}>
                  {formData.score}/10
                </p>
                <p className="text-lg text-gray-600 mt-2">
                  {getScoreLabel(formData.score)}
                </p>
              </div>
              <input
                type="range"
                name="score"
                min="1"
                max="10"
                value={formData.score}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Poor (1)</span>
                <span>Excellent (10)</span>
              </div>
            </div>

            {/* Verification Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Verification Notes *
              </label>
              <textarea
                id="notes"
                name="notes"
                required
                rows="4"
                className="input-field mt-1"
                placeholder="Describe the quality, condition, freshness, packaging, etc."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            {/* Confidence Level */}
            <div>
              <label htmlFor="confidence" className="block text-sm font-medium text-gray-700">
                Confidence Level
              </label>
              <select
                id="confidence"
                name="confidence"
                className="input-field mt-1"
                value={formData.confidence}
                onChange={handleChange}
              >
                <option value="0.60">Low (60%)</option>
                <option value="0.70">Moderate (70%)</option>
                <option value="0.80">High (80%)</option>
                <option value="0.90">Very High (90%)</option>
                <option value="1.00">Certain (100%)</option>
              </select>
            </div>

            {/* Verification Images */}
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                Verification Images (Optional)
              </label>
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="input-field mt-1"
              />
              {images.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {images.length} image(s) selected
                </p>
              )}
            </div>

            {/* Scoring Guidelines */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Scoring Guidelines:
              </p>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• 9-10: Premium quality, perfect condition</li>
                <li>• 7-8: Good quality, minor imperfections</li>
                <li>• 5-6: Average quality, acceptable</li>
                <li>• 3-4: Below average, significant issues</li>
                <li>• 1-2: Poor quality, not recommended</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary"
            >
              {submitting ? 'Submitting...' : 'Submit Verification'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyBatch;