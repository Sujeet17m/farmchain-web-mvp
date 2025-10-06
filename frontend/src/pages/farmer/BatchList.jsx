import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { batchAPI } from '../../services/api';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBatches();
  }, [statusFilter]);

  const fetchBatches = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const response = await batchAPI.getMyBatches(params);
      setBatches(response.data.batches);
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = batches.filter((batch) =>
    batch.produceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Batches</h1>
          <p className="text-gray-600 mt-1">Manage your produce batches</p>
        </div>
        <Link to="/farmer/batches/create" className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Batch
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by produce type..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Batch List */}
      {filteredBatches.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">No batches found</p>
          <Link to="/farmer/batches/create" className="btn-primary inline-flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Your First Batch
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.map((batch) => (
            <Link
              key={batch.id}
              to={`/farmer/batches/${batch.id}`}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {batch.produceType}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    batch.status === 'verified'
                      ? 'bg-green-100 text-green-800'
                      : batch.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {batch.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  Quantity: {batch.quantity} {batch.unit}
                </p>
                {batch.farmingMethod && (
                  <p>
                    Method:{' '}
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {batch.farmingMethod}
                    </span>
                  </p>
                )}
                {batch.qualityScore > 0 && (
                  <p>Quality Score: {batch.qualityScore.toFixed(1)}/10</p>
                )}
                {batch.price && <p>Price: ${batch.price}</p>}
                <p className="text-xs text-gray-500">
                  {new Date(batch.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600">
                  {batch.verifications && batch.verifications.length > 0 && (
                    <span className="flex items-center">
                      <svg
                        className="h-4 w-4 text-green-500 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {batch.verifications.length} verification(s)
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BatchList;