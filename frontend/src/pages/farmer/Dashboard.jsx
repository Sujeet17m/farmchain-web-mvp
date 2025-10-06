import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { batchAPI } from '../../services/api';
import { PlusIcon, CubeIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const FarmerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBatches, setRecentBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, batchesRes] = await Promise.all([
        batchAPI.getDashboardStats(),
        batchAPI.getMyBatches({ limit: 5 }),
      ]);

      setStats(statsRes.data.stats);
      setRecentBatches(batchesRes.data.batches);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your overview.</p>
        </div>
        <Link to="/farmer/batches/create" className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Batch
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Batches</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.totalBatches || 0}
              </p>
            </div>
            <CubeIcon className="h-12 w-12 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Verified Batches</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats?.verifiedBatches || 0}
              </p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Quality Score</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {stats?.avgQualityScore.toFixed(1) || '0.0'}/10
              </p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reputation Score</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {stats?.reputation.toFixed(1) || '0.0'}/10
              </p>
            </div>
            <div className="text-4xl">🏆</div>
          </div>
        </div>
      </div>

      {/* Recent Batches */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Batches</h2>
          <Link to="/farmer/batches" className="text-primary-600 hover:text-primary-700">
            View All →
          </Link>
        </div>

        {recentBatches.length === 0 ? (
          <div className="text-center py-12">
            <CubeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No batches yet</p>
            <Link to="/farmer/batches/create" className="btn-primary mt-4 inline-flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Your First Batch
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentBatches.map((batch) => (
              <Link
                key={batch.id}
                to={`/farmer/batches/${batch.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {batch.produceType}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {batch.quantity} {batch.unit}
                      {batch.farmingMethod && (
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          {batch.farmingMethod}
                        </span>
                      )}
                    </p>
                    {batch.qualityScore > 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        Quality Score: {batch.qualityScore.toFixed(1)}/10
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        batch.status === 'verified'
                          ? 'bg-green-100 text-green-800'
                          : batch.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {batch.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(batch.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;