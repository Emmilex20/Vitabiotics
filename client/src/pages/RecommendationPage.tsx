// /client/src/pages/RecommendationPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizApi } from '../api/quizApi';
import type { RecommendationResponse } from '../types/Quiz';
import ProductCard from '../components/ProductCard'; 
import type { Product } from '../types/Product';

const RecommendationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!user) {
        navigate('/login?redirect=/recommendations');
        return;
    }

    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data: RecommendationResponse = await quizApi.getRecommendations(user);
        setRecommendations(data.recommendations);
        setMessage(data.message);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch recommendations. Please take the quiz first.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, navigate]);


  return (
    <div className="container mx-auto p-6 my-8">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-vita-primary">
          Your Personalized Supplement Plan
        </h1>
        <p className="mt-4 text-xl text-gray-700 font-medium">{message}</p>
        
        {recommendations.length === 0 && !loading && (
            <p className="mt-6 text-lg text-gray-500">
                Looks like you haven't completed the quiz or we couldn't find a direct match. <a onClick={() => navigate('/quiz')} className="text-vita-secondary hover:underline cursor-pointer font-bold">Try the quiz again</a> or explore the full catalog.
            </p>
        )}
      </header>

      {loading && <div className="text-center p-12 text-xl">Analyzing profile and generating plan...</div>}
      {error && <div className="text-center p-12 text-red-600 font-bold">{error}</div>}

      {/* Recommendation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {recommendations.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RecommendationPage;