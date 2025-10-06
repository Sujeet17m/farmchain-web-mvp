import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { batchAPI, voiceAPI } from '../../services/api';
import VoiceRecorder from '../../components/VoiceRecorder';
import toast from 'react-hot-toast';

const CreateBatch = () => {
  const [formData, setFormData] = useState({
    produceType: '',
    quantity: '',
    unit: 'kg',
    harvestDate: new Date().toISOString().split('T')[0],
    farmingMethod: 'conventional',
    transcription: '',
    price: '',
  });
  const [voiceFile, setVoiceFile] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVoiceRecording = async (file) => {
    setVoiceFile(file);
    setTranscribing(true);

    try {
      const formData = new FormData();
      formData.append('voice', file);

      const response = await voiceAPI.transcribe(formData);
      
      if (response.data.transcription) {
        setFormData((prev) => ({
          ...prev,
          transcription: response.data.transcription,
        }));

        // Auto-fill from extracted data if available
        if (response.data.extractedData) {
          const extracted = response.data.extractedData;
          setFormData((prev) => ({
            ...prev,
            produceType: extracted.produceType || prev.produceType,
            quantity: extracted.quantity || prev.quantity,
            unit: extracted.unit || prev.unit,
            farmingMethod: extracted.farmingMethod || prev.farmingMethod,
          }));
        }

        toast.success('Voice transcribed successfully!');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe voice note');
    } finally {
      setTranscribing(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      
      // Append form fields
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      // Append voice file
      if (voiceFile) {
        data.append('voice', voiceFile);
      }

      // Append images
      images.forEach((image) => {
        data.append('images', image);
      });

      const response = await batchAPI.create(data);

      toast.success('Batch created successfully!');
      navigate(`/farmer/batches/${response.data.batch.id}`);
    } catch (error) {
      console.error('Create batch error:', error);
      toast.error('Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Batch</h1>
        <p className="text-gray-600 mt-2">Record your produce details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Voice Recording Section */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🎤 Voice Recording (Optional but Recommended)
          </h2>
          <p className="text-gray-600 mb-4">
            Tell us about your produce. Say things like: "I harvested 50 kg of organic tomatoes today. They are very fresh and red."
          </p>
          <VoiceRecorder onRecordingComplete={handleVoiceRecording} />
          
          {transcribing && (
            <div className="mt-4 text-center text-primary-600">
              Transcribing...
            </div>
          )}

          {formData.transcription && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Transcription:
              </p>
              <p className="text-gray-700 italic">"{formData.transcription}"</p>
            </div>
          )}
        </div>

        {/* Manual Entry Section */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Batch Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="produceType" className="block text-sm font-medium text-gray-700">
                Produce Type *
              </label>
              <input
                type="text"
                id="produceType"
                name="produceType"
                required
                className="input-field mt-1"
                placeholder="e.g., Organic Tomatoes, Fresh Lettuce"
                value={formData.produceType}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                required
                step="0.01"
                className="input-field mt-1"
                placeholder="50"
                value={formData.quantity}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                Unit *
              </label>
              <select
                id="unit"
                name="unit"
                className="input-field mt-1"
                value={formData.unit}
                onChange={handleChange}
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="tons">Tons</option>
                <option value="pounds">Pounds (lbs)</option>
                <option value="pieces">Pieces</option>
              </select>
            </div>

            <div>
              <label htmlFor="harvestDate" className="block text-sm font-medium text-gray-700">
                Harvest Date *
              </label>
              <input
                type="date"
                id="harvestDate"
                name="harvestDate"
                required
                className="input-field mt-1"
                value={formData.harvestDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="farmingMethod" className="block text-sm font-medium text-gray-700">
                Farming Method *
              </label>
              <select
                id="farmingMethod"
                name="farmingMethod"
                className="input-field mt-1"
                value={formData.farmingMethod}
                onChange={handleChange}
              >
                <option value="conventional">Conventional</option>
                <option value="organic">Organic</option>
                <option value="regenerative">Regenerative</option>
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Expected Price (Optional)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                className="input-field mt-1"
                placeholder="Enter price in USD"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                Product Images (Optional, max 5)
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
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/farmer/batches')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || transcribing}
            className="btn-primary"
          >
            {loading ? 'Creating...' : 'Create Batch'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBatch;