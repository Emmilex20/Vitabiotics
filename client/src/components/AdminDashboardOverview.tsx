import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, ShoppingCart, TrendingUp, AlertCircle, Loader, Plus, BarChart3 } from 'lucide-react';
import AdminPaystackDebug from './AdminPaystackDebug';
import { formatNaira } from '../utils/currency';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
}

interface AdminDashboardOverviewProps {
  onNavigate?: (view: 'create' | 'list' | 'orders' | 'reports') => void;
}

const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }

      const [productsRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Handle both response formats (array directly or wrapped in object)
      const products = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data.products || []);
      const orders = ordersRes.data.orders || [];

      const lowStockProducts = products.filter((p: any) => p.stockQuantity < 10).length;
      const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalPrice, 0);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalUsers: 0, // Would need user endpoint
        totalRevenue: totalRevenue,
        pendingOrders: pendingOrders,
        lowStockProducts: lowStockProducts,
      });
    } catch (err) {
      setError('Failed to load dashboard statistics.');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-vita-primary animate-spin mr-3" />
        <span className="text-gray-600 font-medium">Loading dashboard...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-800 font-semibold">Failed to Load Dashboard</p>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Revenue',
      value: formatNaira(stats.totalRevenue || 0),
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: AlertCircle,
      color: 'bg-yellow-100 text-yellow-600',
      bgColor: 'bg-yellow-50',
      alert: stats.pendingOrders > 5,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-vita-primary to-vita-primary/80 text-white rounded-lg p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-white/90">
          Manage your products, orders, and monitor business performance in real-time.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div
              key={index}
              className={`${card.bgColor} rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border-l-4 ${
                card.alert ? 'border-red-500' : 'border-transparent'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts Section */}
      {(stats.pendingOrders > 5 || stats.lowStockProducts > 0) && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-vita-text">⚠️ Action Required</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.pendingOrders > 5 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Pending Orders</h3>
                <p className="text-yellow-800 text-sm mb-3">
                  You have <span className="font-bold">{stats.pendingOrders}</span> pending orders awaiting processing.
                </p>
                <button 
                  onClick={() => onNavigate?.('orders')}
                  className="text-yellow-700 hover:text-yellow-900 font-medium text-sm hover:underline"
                >
                  View Orders →
                </button>
              </div>
            )}
            {stats.lowStockProducts > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">Low Stock Alert</h3>
                <p className="text-red-800 text-sm mb-3">
                  <span className="font-bold">{stats.lowStockProducts}</span> products are running low on stock.
                </p>
                <button 
                  onClick={() => onNavigate?.('list')}
                  className="text-red-700 hover:text-red-900 font-medium text-sm hover:underline"
                >
                  Manage Inventory →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-vita-text mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => onNavigate?.('create')}
            className="bg-vita-primary hover:bg-vita-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Product
          </button>
          <button 
            onClick={() => onNavigate?.('orders')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            View All Orders
          </button>
          <button 
            onClick={() => onNavigate?.('list')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            View Inventory
          </button>
        </div>
      </div>

      {/* Paystack Status Preview */}
      <div>
        <h2 className="text-xl font-bold text-vita-text mb-4">Payment Status</h2>
        <AdminPaystackDebug />
      </div>

    </div>
  );
};

export default AdminDashboardOverview;
