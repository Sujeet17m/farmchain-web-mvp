import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { verificationAPI } from '../../services/api';
import toast from 'react-hot-toast';

const VerificationHistory = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await verificationAPI.getHistory();
      setVerifications(response.data.verifications);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load verification history');
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Verification History</h1>
        <p className="text-gray-600 mt-1">
          {verifications.length} verification{verifications.length !== 1 ? 's' : ''} completed
        </p>
      </div>

      {verifications.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">No verifications yet</p>
          <Link to="/verifier/pending" className="btn-primary mt-4 inline-block">
            Start Verifying
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {verifications.map((verification) => (
            <div key={verification.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {verification.batch.produceType}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Farmer: {verification.batch.farmer.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Your Score: <span className="font-semibold">{verification.score}/10</span>
                  </p>
                  {verification.notes && (
                    <p className="text-sm text-gray-700 mt-2 italic">
                      "{verification.notes}"
                    </p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      verification.batch.status === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {verification.batch.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(verification.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VerificationHistory;