import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { consumerAPI } from '../../services/api';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const SearchProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    produceType: searchParams.get('type') || '',
    farmingMethod: '',
    minQualityScore: '',
  });

  useEffect(() => {
    searchProducts();
  }, []);

  const searchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.produceType) params.produceType = filters.produceType;
      if (filters.farmingMethod) params.farmingMethod = filters.farmingMethod;
      if (filters.minQualityScore) params.minQualityScore = filters.minQualityScore;

      const response = await consumerAPI.searchProducts(params);
      setBatches(response.data.batches);
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchProducts();
  };

  const clearFilters = () => {
    setFilters({
      produceType: '',
      farmingMethod: '',
      minQualityScore: '',
    });
    searchProducts();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Search Products</h1>
        <p className="text-gray-600 mt-1">Find fresh produce from verified farmers</p>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="produceType" className="block text-sm font-medium text-gray-700 mb-1">
                Search by Product
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="produceType"
                  name="produceType"
                  className="input-field pl-10"
                  placeholder="e.g., tomatoes, rice, lettuce..."
                  value={filters.produceType}
                  onChange={handleFilterChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="farmingMethod" className="block text-sm font-medium text-gray-700 mb-1">
                Farming Method
              </label>
              <select
                id="farmingMethod"
                name="farmingMethod"
                className="input-field"
                value={filters.farmingMethod}
                onChange={handleFilterChange}
              >
                <option value="">All Methods</option>
                <option value="organic">Organic</option>
                <option value="conventional">Conventional</option>
                <option value="regenerative">Regenerative</option>
              </select>
            </div>

            <div>
              <label htmlFor="minQualityScore" className="block text-sm font-medium text-gray-700 mb-1">
                Min Quality Score
              </label>
              <select
                id="minQualityScore"
                name="minQualityScore"
                className="input-field"
                value={filters.minQualityScore}
                onChange={handleFilterChange}
              >
                <option value="">Any Score</option>
                <option value="9">9+ (Excellent)</option>
                <option value="8">8+ (Very Good)</option>
                <option value="7">7+ (Good)</option>
                <option value="6">6+ (Average)</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-4">
            <button type="submit" className="btn-primary">
              Search
            </button>
            <button type="button" onClick={clearFilters} className="btn-secondary">
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : batches.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">No products found</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Found {batches.length} product{batches.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => (
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

                <div className="flex items-center justify-between mb-3">
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

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  {batch.price && (
                    <p className="text-lg font-bold text-primary-600">
                      ${batch.price}
                    </p>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(batch.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchProducts;