import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { verificationAPI } from '../../services/api';
import { CheckCircleIcon, ClockIcon, TrophyIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const VerifierDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await verificationAPI.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Verifier Dashboard</h1>
        <p className="text-gray-600 mt-1">Help maintain quality standards</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Verifications</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.totalVerifications || 0}
              </p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Score Given</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {stats?.avgScore.toFixed(1) || '0.0'}/10
              </p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Your Reputation</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {stats?.reputation.toFixed(1) || '0.0'}/10
              </p>
            </div>
            <TrophyIcon className="h-12 w-12 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/verifier/pending"
            className="p-6 border-2 border-primary-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
          >
            <ClockIcon className="h-8 w-8 text-primary-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Verify Batches</h3>
            <p className="text-sm text-gray-600">
              Review and verify pending produce batches
            </p>
          </Link>

          <Link
            to="/verifier/history"
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-md transition-all"
          >
            <CheckCircleIcon className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">View History</h3>
            <p className="text-sm text-gray-600">
              See your past verifications
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Verifications */}
      {stats?.recentVerifications && stats.recentVerifications.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Verifications
          </h2>
          <div className="space-y-3">
            {stats.recentVerifications.map((verification) => (
              <div
                key={verification.id}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {verification.batch.produceType}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Score: {verification.score}/10
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      verification.batch.status === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {verification.batch.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(verification.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifierDashboard;