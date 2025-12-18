// /client/src/pages/ProductListPage.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Product } from '../types/Product';
import { productApi } from '../api/productApi';
import ProductCard from '../components/ProductCard';
import { ChevronDown } from 'lucide-react';

const ProductListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filterCategory, setFilterCategory] = useState<string | undefined>(searchParams.get('category') || undefined);
  const [filterAudience, setFilterAudience] = useState<string | undefined>(searchParams.get('audience') || undefined);
  const [filterBenefit, setFilterBenefit] = useState<string | undefined>(searchParams.get('benefit') || undefined);
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['Vitamins', 'Minerals', 'Herbal', 'Digestion', 'Immunity', 'Energy'];
  const audiences = ['Women', 'Men', 'Kids', 'General'];
  const benefits = ['Energy', 'Immunity', 'Joint Health', 'Sleep', 'Digestion', 'Stress', 'Cognitive']; 

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productApi.getProducts({ category: filterCategory });
        
        // Apply client-side filtering for audience and benefits
        let filtered = data;
        if (filterAudience) {
          filtered = filtered.filter(p => p.audience === filterAudience || p.audience === 'General');
        }
        if (filterBenefit) {
          filtered = filtered.filter(p => p.keyBenefits.includes(filterBenefit));
        }
        
        setProducts(filtered);
      } catch (err) {
        setError('Failed to load products. The API may be offline.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filterCategory, filterAudience, filterBenefit]);

  const handleFilterChange = (type: 'category' | 'audience' | 'benefit', value: string) => {
    if (type === 'category') setFilterCategory(value);
    if (type === 'audience') setFilterAudience(value);
    if (type === 'benefit') setFilterBenefit(value);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-vita-primary text-white py-12 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-extrabold">Find Your Perfect Supplement</h1>
          <p className="mt-3 text-lg opacity-90">Discover products tailored to your health goals and lifestyle</p>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden mb-6 flex items-center gap-2 px-4 py-2 bg-vita-primary text-white rounded-lg hover:bg-[#004a44]"
        >
          <span>Filters</span>
          <ChevronDown size={18} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block md:w-56 flex-shrink-0`}>
            <div className="bg-gray-50 rounded-lg p-6 sticky top-20 space-y-6">
              <h3 className="text-lg font-bold text-vita-primary border-b pb-3">Filters</h3>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                <div className="space-y-2">
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                      !filterCategory ? 'bg-vita-secondary text-vita-text font-semibold' : 'hover:bg-gray-200'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleFilterChange('category', cat)}
                      className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                        filterCategory === cat ? 'bg-vita-secondary text-vita-text font-semibold' : 'hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audience Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Target Audience</label>
                <div className="space-y-2">
                  <button
                    onClick={() => handleFilterChange('audience', '')}
                    className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                      !filterAudience ? 'bg-vita-secondary text-vita-text font-semibold' : 'hover:bg-gray-200'
                    }`}
                  >
                    All People
                  </button>
                  {audiences.map(aud => (
                    <button
                      key={aud}
                      onClick={() => handleFilterChange('audience', aud)}
                      className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                        filterAudience === aud ? 'bg-vita-secondary text-vita-text font-semibold' : 'hover:bg-gray-200'
                      }`}
                    >
                      {aud}
                    </button>
                  ))}
                </div>
              </div>

              {/* Benefit Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Health Benefits</label>
                <div className="space-y-2">
                  <button
                    onClick={() => handleFilterChange('benefit', '')}
                    className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                      !filterBenefit ? 'bg-vita-secondary text-vita-text font-semibold' : 'hover:bg-gray-200'
                    }`}
                  >
                    All Benefits
                  </button>
                  {benefits.map(ben => (
                    <button
                      key={ben}
                      onClick={() => handleFilterChange('benefit', ben)}
                      className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                        filterBenefit === ben ? 'bg-vita-secondary text-vita-text font-semibold' : 'hover:bg-gray-200'
                      }`}
                    >
                      {ben}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear All Filters */}
              {(filterCategory || filterAudience || filterBenefit) && (
                <button
                  onClick={() => {
                    setFilterCategory(undefined);
                    setFilterAudience(undefined);
                    setFilterBenefit(undefined);
                  }}
                  className="w-full py-2 px-3 bg-red-100 text-red-700 rounded font-semibold hover:bg-red-200 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Active Filters Display */}
            {(filterCategory || filterAudience || filterBenefit) && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg flex flex-wrap gap-2 items-center">
                <span className="text-sm font-semibold text-gray-700">Active Filters:</span>
                {filterCategory && (
                  <span className="px-3 py-1 bg-vita-secondary text-vita-text rounded-full text-sm font-semibold">
                    {filterCategory}
                  </span>
                )}
                {filterAudience && (
                  <span className="px-3 py-1 bg-vita-secondary text-vita-text rounded-full text-sm font-semibold">
                    For {filterAudience}
                  </span>
                )}
                {filterBenefit && (
                  <span className="px-3 py-1 bg-vita-secondary text-vita-text rounded-full text-sm font-semibold">
                    {filterBenefit}
                  </span>
                )}
              </div>
            )}

            {loading && <p className="text-center text-lg text-gray-600">Loading products...</p>}
            {error && <p className="text-center text-red-600 font-medium text-lg">{error}</p>}

            {!loading && !error && products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">No products found matching your filters.</p>
                <button
                  onClick={() => {
                    setFilterCategory(undefined);
                    setFilterAudience(undefined);
                    setFilterBenefit(undefined);
                  }}
                  className="px-4 py-2 bg-vita-primary text-white rounded-lg hover:bg-[#004a44]"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Product Grid */}
            {!loading && products.length > 0 && (
              <>
                <p className="text-gray-600 mb-6">Showing {products.length} product{products.length !== 1 ? 's' : ''}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;