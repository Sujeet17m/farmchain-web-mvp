import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { consumerAPI } from '../../services/api';
import { MagnifyingGlassIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ConsumerHome = () => {
  const [featuredBatches, setFeaturedBatches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [featuredRes, categoriesRes] = await Promise.all([
        consumerAPI.getFeatured(),
        consumerAPI.getCategories(),
      ]);

      setFeaturedBatches(featuredRes.data.batches);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      console.error('Error fetching home data:', error);
      toast.error('Failed to load data');
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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to FarmChain 🌾
        </h1>
        <p className="text-xl mb-6 text-primary-50">
          Track your food from farm to table with blockchain transparency
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/consumer/scan" className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center">
            <QrCodeIcon className="h-5 w-5 mr-2" />
            Scan QR Code
          </Link>
          <Link to="/consumer/search" className="bg-primary-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-900 transition-colors flex items-center">
            <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
            Browse Products
          </Link>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.produceType}
                to={`/consumer/search?type=${encodeURIComponent(category.produceType)}`}
                className="card text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-2">🌾</div>
                <p className="font-semibold text-gray-900 text-sm">
                  {category.produceType}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {category.count} available
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Products */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Featured Products
          </h2>
          <Link to="/consumer/search" className="text-primary-600 hover:text-primary-700 font-medium">
            View All →
          </Link>
        </div>

        {featuredBatches.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No featured products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBatches.map((batch) => (
              <Link
                key={batch.id}
                to={`/consumer/product/${batch.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                {batch.images && batch.images.length > 0 ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${batch.images[0]}`}
                    alt={batch.produceType}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-4 flex items-center justify-center text-6xl">
                    🌾
                  </div>
                )}

                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {batch.produceType}
                  </h3>
                  {batch.farmingMethod === 'organic' && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-semibold">
                      Organic
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  by {batch.farmer.name}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">⭐</span>
                    <span className="font-semibold text-gray-900">
                      {batch.qualityScore.toFixed(1)}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">/10</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {batch.quantity} {batch.unit}
                  </span>
                </div>

                {batch.price && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-lg font-bold text-primary-600">
                      ${batch.price}
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCodeIcon className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">1. Scan QR Code</h3>
            <p className="text-sm text-gray-600">
              Find the QR code on your product and scan it with your device
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">2. View Journey</h3>
            <p className="text-sm text-gray-600">
              See the complete journey from farm to your table
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">3. Verify Quality</h3>
            <p className="text-sm text-gray-600">
              Check blockchain-verified quality scores and farmer information
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerHome;