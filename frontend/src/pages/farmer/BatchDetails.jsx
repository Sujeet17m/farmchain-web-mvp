import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { batchAPI } from '../../services/api';
import QRCode from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const BatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatchDetails();
  }, [id]);

  const fetchBatchDetails = async () => {
    try {
      const response = await batchAPI.getBatch(id);
      setBatch(response.data.batch);
    } catch (error) {
      console.error('Error fetching batch details:', error);
      toast.error('Failed to load batch details');
      navigate('/farmer/batches');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this batch?')) return;

    try {
      await batchAPI.deleteBatch(id);
      toast.success('Batch deleted successfully');
      navigate('/farmer/batches');
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error(error.response?.data?.error || 'Failed to delete batch');
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-code');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `farmchain-qr-${batch.id}.png`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Batch not found</p>
        <Link to="/farmer/batches" className="btn-primary mt-4 inline-block">
          Back to Batches
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <button
            onClick={() => navigate('/farmer/batches')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Batches
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{batch.produceType}</h1>
          <p className="text-gray-600 mt-1">
            Batch ID: {batch.id.substring(0, 8)}...
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span
            className={`px-4 py-2 text-sm font-semibold rounded-full ${
              batch.status === 'verified'
                ? 'bg-green-100 text-green-800'
                : batch.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {batch.status}
          </span>
          {batch.verifications && batch.verifications.length === 0 && (
            <button
              onClick={handleDelete}
              className="btn-danger flex items-center"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Batch Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Batch Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
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
              {batch.price && (
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${batch.price}
                  </p>
                </div>
              )}
              {batch.qualityScore > 0 && (
                <div>
                  <p className="text-sm text-gray-600">Quality Score</p>
                  <p className="text-lg font-semibold text-green-600">
                    {batch.qualityScore.toFixed(1)}/10
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Voice Note */}
          {batch.transcription && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Voice Note
              </h2>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-gray-700 italic">"{batch.transcription}"</p>
                </div>
              {batch.voiceNoteUrl && (
                <audio
                  controls
                  className="w-full mt-4"
                  src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${batch.voiceNoteUrl}`}
                />
              )}
            </div>
          )}

          {/* Verifications */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quality Verifications ({batch.verifications?.length || 0}/3)
            </h2>

            {!batch.verifications || batch.verifications.length === 0 ? (
              <div className="text-center py-8">
                <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Waiting for verifications...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Your batch will be verified by community members soon.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {batch.verifications.map((verification, index) => (
                  <div
                    key={verification.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {verification.verifier.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Reputation: {verification.verifier.reputation.toFixed(1)}/10
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">
                          {verification.score}/10
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(verification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {verification.notes && (
                      <p className="text-gray-700 mt-2">{verification.notes}</p>
                    )}
                  </div>
                ))}

                {batch.status === 'verified' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" />
                      <div>
                        <p className="font-semibold text-green-900">
                          Consensus Reached!
                        </p>
                        <p className="text-sm text-green-700">
                          Your batch has been verified by the community.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Supply Chain Events */}
          {batch.events && batch.events.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Supply Chain Timeline
              </h2>
              <div className="space-y-4">
                {batch.events.map((event, index) => (
                  <div key={event.id} className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-semibold">
                        {index + 1}
                      </span>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="font-semibold text-gray-900 capitalize">
                        {event.eventType.replace('_', ' ')}
                      </p>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {event.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(event.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blockchain Info */}
          {batch.blockchainHash && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🔗 Blockchain Verification
              </h2>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  This batch is recorded on the blockchain for immutable proof.
                </p>
                <p className="text-xs text-gray-600 break-all mb-2">
                  Transaction Hash: {batch.blockchainHash}
                </p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${batch.blockchainHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View on Etherscan →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code */}
          <div className="card text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              QR Code
            </h2>
            {batch.qrCode ? (
              <div>
                <img
                  src={batch.qrCode}
                  alt="QR Code"
                  className="mx-auto mb-4"
                  style={{ width: '200px', height: '200px' }}
                />
              </div>
            ) : (
              <div className="mb-4">
                <QRCode
                  id="qr-code"
                  value={JSON.stringify({
                    batchId: batch.id,
                    type: 'farmchain',
                  })}
                  size={200}
                  level="H"
                  className="mx-auto"
                />
              </div>
            )}
            <button
              onClick={downloadQR}
              className="btn-secondary w-full"
            >
              Download QR Code
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Share this QR code with buyers
            </p>
          </div>

          {/* Farmer Info */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Farmer Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">{batch.farmer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{batch.farmer.email}</p>
              </div>
              {batch.farmer.phone && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">
                    {batch.farmer.phone}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Reputation</p>
                <p className="font-semibold text-yellow-600">
                  {batch.farmer.reputation.toFixed(1)}/10 ⭐
                </p>
              </div>
            </div>
          </div>

          {/* Images */}
          {batch.images && batch.images.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Product Images
              </h2>
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
      </div>
    </div>
  );
};

export default BatchDetails;