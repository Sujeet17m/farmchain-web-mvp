import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { verificationAPI } from '../../services/api';
import { ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PendingBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingBatches();
  }, []);

  const fetchPendingBatches = async () => {
    try {
      const response = await verificationAPI.getPendingBatches();
      setBatches(response.data.batches);
    } catch (error) {
      console.error('Error fetching pending batches:', error);
      toast.error('Failed to load pending batches');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pending Verifications</h1>
        <p className="text-gray-600 mt-1">
          {batches.length} batch{batches.length !== 1 ? 'es' : ''} waiting for verification
        </p>
      </div>

      {/* Batch List */}
      {batches.length === 0 ? (
        <div className="card text-center py-12">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No batches pending verification</p>
          <p className="text-sm text-gray-500 mt-2">
            Check back later for new batches to verify
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <div key={batch.id} className="card">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {batch.produceType}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  by {batch.farmer.name}
                </p>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>Quantity: {batch.quantity} {batch.unit}</p>
                <p className="capitalize">Method: {batch.farmingMethod}</p>
                <p>
                  Verifications: {batch.verificationCount}/3
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(batch.createdAt).toLocaleDateString()}
                </p>
              </div>

              <Link
                to={`/verifier/verify/${batch.id}`}
                className="btn-primary w-full text-center"
              >
                Verify Now
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingBatches;