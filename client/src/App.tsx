// /client/src/App.tsx (UPDATED for Batch 8 completion)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; // New Import
import Navbar from './components/Navbar'; // New Import
import Footer from './components/Footer'; // New Import
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductListPage from './pages/ProductListPage'; 
import ProductDetailPage from './pages/ProductDetailPage'; 
import CartPage from './pages/CartPage'; // New Import
import CheckoutPage from './pages/CheckoutPage'; // New Import
import SupplementQuiz from './components/SupplementQuiz'; // New Import
import RecommendationPage from './pages/RecommendationPage'; // New Import
import HomePage from './pages/HomePage';
import AdminRoute from './components/AdminRoute'; // New Import
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import TrackingLookupPage from './pages/TrackingLookupPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

const OrderSuccessPage: React.FC = () => (
    <div className="p-8 text-center min-h-screen">
        <h1 className="text-4xl font-bold text-green-600">🎉 Order Placed Successfully!</h1>
        <p className="mt-4 text-xl text-gray-600">
            Thank you for your purchase. You can view your order history in your profile (coming soon).
        </p>
        <Link to="/products" className="mt-6 inline-block py-3 px-6 text-white bg-vita-primary rounded-lg hover:bg-[#004a44]">
            Continue Shopping
        </Link>
    </div>
);


function App() {
  return (
    <AuthProvider>
      <CartProvider> {/* <-- Cart Provider wraps all routes */}
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar /> {/* <-- Navbar at top */}
            <main className="flex-grow">
              <Toaster />
              <Routes>
                {/* Public/Core Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductListPage />} /> 
                <Route path="/product/:slug" element={<ProductDetailPage />} /> 

                {/* Transactional Routes */}
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />

                {/* Educational/Innovation Routes */}
                <Route path="/quiz" element={<SupplementQuiz />} />
                <Route path="/recommendations" element={<RecommendationPage />} />
                {/* Public tracking lookup */}
                <Route path="/track" element={<TrackingLookupPage />} />

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* --- Protected Admin Routes --- */}
            {/* All routes inside AdminRoute require admin role */}
            <Route path="/admin" element={<AdminRoute />}>
                <Route path="dashboard" element={<AdminDashboardPage />} />
            </Route>
                
                {/* Future Protected Routes */}
                <Route path="/profile" element={<ProtectedRoute />}> 
                  <Route path="" element={<ProfilePage />} />
                </Route>
                <Route path="/orders" element={<ProtectedRoute />}>
                  <Route path="" element={<OrdersPage />} />
                </Route>
                <Route path="/orders/:id" element={<ProtectedRoute />}>
                  <Route path="" element={<OrderDetailPage />} />
                </Route>
              </Routes>
            </main>
            <Footer /> {/* <-- Footer at bottom */}
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;