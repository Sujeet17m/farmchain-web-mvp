import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { consumerAPI } from '../../services/api';
import { ArrowLeftIcon, CheckCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ProductJourney = () => {
  const { id } = useParams();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const response = await consumerAPI.trackProduct(id);
      setBatch(response.data.batch);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
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
        <p className="text-gray-600 mb-4">Product not found</p>
        <Link to="/consumer" className="btn-primary inline-block">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/consumer"
          className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{batch.produceType}</h1>
            <p className="text-gray-600 mt-1">Product Journey & Verification</p>
          </div>
          {batch.status === 'verified' && (
            <div className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              <span className="font-semibold">Verified</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Details */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Product Details
            </h2>
            
            {batch.images && batch.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {batch.images.map((image, index) => (
                  <img
                    key={index}
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${image}`}
                    alt={`Product ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

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
              {batch.qualityScore > 0 && (
                <div>
                  <p className="text-sm text-gray-600">Quality Score</p>
                  <p className="text-lg font-semibold text-green-600">
                    {batch.qualityScore.toFixed(1)}/10 ⭐
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Farmer's Voice Note */}
          {batch.transcription && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🎤 Message from the Farmer
              </h2>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-gray-700 italic mb-3">
                  "{batch.transcription}"
                </p>
                {batch.voiceNoteUrl && (
                  <audio
                    controls
                    className="w-full"
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${batch.voiceNoteUrl}`}
                  />
                )}
              </div>
            </div>
          )}

          {/* Quality Verifications */}
          {batch.verifications && batch.verifications.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quality Verifications
              </h2>
              
              {batch.verificationStats && (
                <div className="p-4 bg-blue-50 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Verified by</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {batch.verificationStats.count} experts
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Average Score</p>
                      <p className="text-2xl font-bold text-green-600">
                        {batch.verificationStats.avgScore.toFixed(1)}/10
                      </p>
                    </div>
                    {batch.verificationStats.consensusReached && (
                      <CheckCircleIcon className="h-12 w-12 text-green-600" />
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {batch.verifications.map((verification) => (
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
                      </div>
                    </div>
                    {verification.notes && (
                      <p className="text-gray-700 mt-2">{verification.notes}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(verification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supply Chain Timeline */}
          {batch.events && batch.events.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📍 Supply Chain Journey
              </h2>
              <div className="space-y-4">
                {batch.events.map((event, index) => (
                  <div key={event.id} className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-semibold text-sm">
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

          {/* Blockchain Verification */}
          {batch.blockchainHash && (
            <div className="card">
              <div className="flex items-start">
                <ShieldCheckIcon className="h-8 w-8 text-blue-600 mr-3 flex-shrink-0" />
                <div className="flex-1">
                 <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Blockchain Verified
                  </h2>
                  <p className="text-sm text-gray-600 mb-3">
                    This product's journey is permanently recorded on the blockchain, ensuring authenticity and transparency.
                  </p>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Transaction Hash:</p>
                    <p className="text-xs font-mono text-gray-800 break-all mb-2">
                      {batch.blockchainHash}
                    </p>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${batch.blockchainHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View on Blockchain Explorer →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Farmer Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Meet the Farmer
            </h2>
            <div className="space-y-3">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                👨‍🌾
              </div>
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
                  <p className="font-semibold text-gray-900">{batch.farmer.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Reputation Score</p>
                <p className="font-semibold text-yellow-600">
                  {batch.farmer.reputation.toFixed(1)}/10 🏆
                </p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Trust Indicators
            </h2>
            <div className="space-y-3">
              {batch.status === 'verified' && (
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Community Verified</p>
                    <p className="text-sm text-gray-600">
                      Verified by {batch.verifications?.length || 0} independent experts
                    </p>
                  </div>
                </div>
              )}

              {batch.blockchainHash && (
                <div className="flex items-start">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Blockchain Secured</p>
                    <p className="text-sm text-gray-600">
                      Immutable record on Ethereum blockchain
                    </p>
                  </div>
                </div>
              )}

              {batch.farmingMethod === 'organic' && (
                <div className="flex items-start">
                  <span className="text-green-600 mr-2 text-xl">🌱</span>
                  <div>
                    <p className="font-medium text-gray-900">Organic Certified</p>
                    <p className="text-sm text-gray-600">
                      Grown without synthetic pesticides
                    </p>
                  </div>
                </div>
              )}

              {batch.voiceNoteUrl && (
                <div className="flex items-start">
                  <span className="mr-2 text-xl">🎤</span>
                  <div>
                    <p className="font-medium text-gray-900">Farmer's Voice Note</p>
                    <p className="text-sm text-gray-600">
                      Personal message from the farmer
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price Information */}
          {batch.price && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Pricing
              </h2>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary-600 mb-2">
                  ${batch.price}
                </p>
                <p className="text-sm text-gray-600">
                  per {batch.unit}
                </p>
              </div>
            </div>
          )}

          {/* Share/Actions */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Share Product
            </h2>
            <div className="space-y-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied to clipboard!');
                }}
                className="btn-secondary w-full"
              >
                📋 Copy Link
              </button>
              <button
                onClick={() => {
                  const text = `Check out this ${batch.produceType} from ${batch.farmer.name} on FarmChain! ${window.location.href}`;
                  if (navigator.share) {
                    navigator.share({ title: batch.produceType, text, url: window.location.href });
                  } else {
                    toast.info('Sharing not supported on this browser');
                  }
                }}
                className="btn-secondary w-full"
              >
                🔗 Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductJourney;