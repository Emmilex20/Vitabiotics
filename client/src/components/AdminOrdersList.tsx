import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatNaira } from '../utils/currency';
import { Clock, Package, Truck, CheckCircle, AlertCircle, Loader, Search } from 'lucide-react';

interface OrderItem {
  product: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  orderItems: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  // tracking
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  trackingStatus?: string;
  trackingHistory?: any[];
}

const AdminOrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered'>('all');

  // Tracking / bulk assign state
  const [carriers, setCarriers] = useState<string[]>([]);
  const [perOrderCarrierMap, setPerOrderCarrierMap] = useState<Record<string, string>>({});
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [assigningOrderIds, setAssigningOrderIds] = useState<Set<string>>(new Set());
  const [bulkCarrier, setBulkCarrier] = useState<string>('random');
  const [bulkAssigning, setBulkAssigning] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchCarriers();
  }, []);

  const fetchCarriers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/orders/tracking/carriers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const carriersList = res.data?.carriers;
      if (!Array.isArray(carriersList)) {
        console.warn('Unexpected carriers response', res.data);
        setCarriers([]);
      } else {
        setCarriers(carriersList);
      }
    } catch (err) {
      // non-fatal
      console.warn('Failed to fetch carriers', err);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.orders || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch orders. Please try again.';
      setError(errorMessage);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, status: newStatus as Order['status'] } : o)));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update order status.';
      setError(errorMessage);
      console.error('Error updating order:', err);
    }
  };

  const assignTracking = async (orderId: string) => {
    const carrier = perOrderCarrierMap[orderId] || 'random';
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('No authentication token found. Please log in again.');
      return;
    }
    setAssigningOrderIds(new Set(assigningOrderIds).add(orderId));
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/orders/${orderId}/auto-assign-tracking`, { carrier }, { headers: { Authorization: `Bearer ${token}` } });
      (await import('react-hot-toast')).default.success(res.data.message || 'Tracking assigned');
      await fetchOrders();
    } catch (err: any) {
      (await import('react-hot-toast')).default.error(err.response?.data?.message || 'Failed to assign tracking');
      console.error('assignTracking error', err);
    } finally {
      const copy = new Set(assigningOrderIds);
      copy.delete(orderId);
      setAssigningOrderIds(copy);
    }
  };

  const bulkAssignTracking = async () => {
    const orderIds = Array.from(selectedOrders);
    if (orderIds.length === 0) {
      (await import('react-hot-toast')).default.error('No orders selected');
      return;
    }
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('No authentication token found. Please log in again.');
      return;
    }
    setBulkAssigning(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/orders/bulk-assign-tracking`, { orderIds, carrier: bulkCarrier }, { headers: { Authorization: `Bearer ${token}` } });
      (await import('react-hot-toast')).default.success(res.data.message || 'Bulk assign completed');
      setSelectedOrders(new Set());
      await fetchOrders();
    } catch (err: any) {
      (await import('react-hot-toast')).default.error(err.response?.data?.message || 'Bulk assign failed');
      console.error('bulkAssignTracking error', err);
    } finally {
      setBulkAssigning(false);
    }
  };


  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-vita-primary animate-spin mr-3" />
        <span className="text-gray-600 font-medium">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-vita-text">Order Management</h2>
        <div className="text-sm bg-vita-primary/10 text-vita-primary px-3 py-1 rounded-full font-semibold">
          Total: {orders.length}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, email, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vita-primary"
            />
          </div>
        </div>
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vita-primary bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Bulk Assign Controls */}
      <div className="mb-4 flex flex-col md:flex-row items-start md:items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <select value={bulkCarrier} onChange={(e) => setBulkCarrier(e.target.value)} className="p-2 border rounded bg-white">
            <option value="random">Random</option>
            {(carriers || []).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={bulkAssignTracking} disabled={bulkAssigning} className="px-3 py-1 bg-vita-primary text-white rounded">
            {bulkAssigning ? 'Assigning...' : 'Assign to selected'}
          </button>
        </div>
        <div className="text-sm text-gray-600">
          <button onClick={() => setSelectedOrders(new Set(orders.map(o => o._id)))} className="underline mr-2">Select all</button>
          <button onClick={() => setSelectedOrders(new Set())} className="underline">Clear</button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start">
                {/* Select for bulk */}
                <div className="flex items-start">
                  <input type="checkbox" className="mt-1" checked={selectedOrders.has(order._id)} onChange={(e) => {
                    const copy = new Set(selectedOrders);
                    if (e.target.checked) copy.add(order._id);
                    else copy.delete(order._id);
                    setSelectedOrders(copy);
                  }} />
                </div>

                {/* Order Info */}
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Order ID</p>
                  <p className="font-mono text-sm font-semibold text-gray-900">{order._id.slice(-8)}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Customer Info */}
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Customer</p>
                  <p className="font-semibold text-gray-900">
                    {order.user.firstName} {order.user.lastName}
                  </p>
                  <p className="text-xs text-gray-600">{order.user.email}</p>
                </div>

                {/* Items Count & Total */}
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Items</p>
                  <p className="font-semibold text-gray-900">{order.orderItems.length}</p>
                  <p className="text-xs text-vita-primary font-semibold mt-2">
                    Total: {formatNaira(order.totalPrice || 0)}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Status</p>
                  <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </div>

                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-vita-primary bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
                </div>

                {/* Tracking / assign controls */}
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Tracking</p>

                  {order.trackingNumber ? (
                    <div className="text-sm">
                      <div className="font-medium">{order.trackingNumber}</div>
                      {order.carrier && <div className="text-xs text-gray-500">{order.carrier}</div>}
                      {order.trackingUrl && <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="text-vita-primary text-sm inline-block mt-1">Track</a>}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select value={perOrderCarrierMap[order._id] || 'random'} onChange={(e) => setPerOrderCarrierMap({ ...perOrderCarrierMap, [order._id]: e.target.value })} className="p-1 border rounded text-sm bg-white">
                        <option value="random">Random</option>
                        {(carriers || []).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <button onClick={() => assignTracking(order._id)} disabled={assigningOrderIds.has(order._id)} className="px-3 py-1 bg-vita-primary text-white rounded text-sm">
                        {assigningOrderIds.has(order._id) ? 'Assigning...' : 'Assign'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Preview */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Items</p>
                <div className="text-sm text-gray-700 space-y-1">
                  {order.orderItems.map((item, idx) => (
                    <p key={idx} className="flex justify-between">
                      <span>{item.product} × {item.quantity}</span>
                      <span className="font-medium">{formatNaira((item.price || 0) * (item.quantity || 0))}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersList;
