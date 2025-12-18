// /client/src/pages/ProductDetailPage.tsx (CORRECTED)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useNavigate added here
import type { Product } from '../types/Product';
import { productApi } from '../api/productApi';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/currency';

// A simple component for displaying key details
const EducationalSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="p-4 bg-gray-50 border-l-4 border-vita-primary rounded-lg shadow-inner">
    <h4 className="text-xl font-semibold text-vita-primary mb-2">{title}</h4>
    {children}
  </div>
);

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const navigate = useNavigate(); // <-- Hook used at the top level

  // Corrected: Data Fetching logic in useEffect
  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productApi.getProductBySlug(slug);
        setProduct(data);
      } catch (err) {
        setError('Product not found or API error.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);
  
  // Corrected: Add to Cart logic is a regular function, not inside useEffect
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, qty);
      navigate('/cart'); // Redirect to the cart page after adding
    }
  };


  if (loading) return <div className="text-center p-12 text-xl">Loading product details...</div>;
  if (error) return <div className="text-center p-12 text-red-600 font-bold">{error}</div>;
  if (!product) return <div className="text-center p-12 text-gray-600">No product data.</div>;

  return (
    <div className="container mx-auto p-6 bg-white shadow-xl rounded-lg my-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Column 1: Image & Price */}
        <div className="lg:col-span-1">
          <img 
            src={product.imageUrls[0] || 'https://via.placeholder.com/600x600.png?text=Product+Image'} 
            alt={product.name} 
            className="w-full h-auto rounded-xl shadow-md"
          />
          <div className="mt-6 text-center">
            <p className="text-4xl font-extrabold text-vita-primary mt-2">
              {formatNaira(product.price)}
            </p>
            
            {/* Quantity Selector */}
            <div className="mt-4 flex justify-center items-center space-x-2">
                <label htmlFor="qty" className="font-medium text-gray-700">Quantity:</label>
                <select 
                    id="qty"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="p-2 border rounded-lg focus:ring-vita-secondary focus:border-vita-secondary"
                >
                    {[...Array(10).keys()].map(x => ( // Allow up to 10 for example
                        <option key={x + 1} value={x + 1}>{x + 1}</option>
                    ))}
                </select>
            </div>

            <button 
              onClick={handleAddToCart} // <-- Corrected Handler Call
              disabled={product.stockQuantity === 0}
              className={`mt-4 w-full py-3 text-lg font-semibold text-white rounded-lg transition-colors ${
                product.stockQuantity === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-vita-primary hover:bg-[#004a44]'
              }`}
            >
              {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>

        {/* Column 2 & 3: Details and Educational Content */}
        <div className="lg:col-span-2 space-y-8">
          <header className="border-b pb-4">
            <h1 className="text-4xl font-extrabold text-vita-text">{product.name}</h1>
            <p className="text-lg font-medium text-gray-500 mt-1">Category: {product.category}</p>
          </header>

          {/* Product Description */}
          <section>
            <h2 className="text-2xl font-bold text-vita-primary mb-3">Product Overview</h2>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </section>

          {/* Educational Content Section (Key Innovation) */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-vita-primary">The Science Behind It</h2>

            {/* Scientific Name */}
            <EducationalSection title="Scientific Compound">
              <p className="font-mono italic text-gray-800">{product.scientificName || 'N/A'}</p>
            </EducationalSection>
            
            {/* Key Benefits */}
            <EducationalSection title="Proven Benefits">
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {product.keyBenefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </EducationalSection>

            {/* Dosage & Safety */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EducationalSection title="Suggested Dosage">
                <p className="text-gray-700">{product.suggestedDosage}</p>
              </EducationalSection>
              <EducationalSection title="Important Safety Info">
                <p className="text-red-700 font-medium">{product.contraindications}</p>
              </EducationalSection>
            </div>
            
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;