import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatNaira } from '../utils/currency';

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoading(true);
      try {
        const token = user.token;
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/myorders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // support either { orders } or direct array responses
        const payload = res.data;
        const dataOrders = Array.isArray(payload) ? payload : payload.orders || [];
        setOrders(dataOrders);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) return <div className="p-8">Please login to view orders.</div>;

  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = async (orderId: string) => {
    if (expanded === orderId) { setExpanded(null); return; }
    // fetch fresh order details
    if (!user) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const updatedOrder = res.data;
      setOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
      setExpanded(orderId);
    } catch (err:any) {
      setError(err.response?.data?.message || 'Failed to load order details');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order._id} className="bg-white rounded-lg shadow">
            <div className="p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold">Order #{order._id}</div>
                <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="font-bold">{formatNaira(order.totalAmount)}</div>
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${order.trackingStatus === 'Delivered' || order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : order.trackingStatus === 'In Transit' || order.orderStatus === 'Shipped' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}`}>
                    {order.trackingStatus || order.orderStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 border-t flex items-center justify-between">
              <button onClick={() => toggleExpand(order._id)} className="text-sm text-vita-primary hover:underline">{expanded === order._id ? 'Hide tracking' : 'View tracking'}</button>
              <div>
                <button onClick={() => navigate(`/orders/${order._id}`)} className="text-sm text-gray-600 hover:underline mr-4">Details</button>
                <button onClick={() => navigate(`/orders/${order._id}`)} className="text-sm text-vita-primary hover:underline">Open</button>
              </div>
            </div>

            {expanded === order._id && (
              <div className="p-4 bg-gray-50">
                <h4 className="font-semibold mb-2">Tracking History</h4>
                {order.trackingHistory && order.trackingHistory.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {[...order.trackingHistory].reverse().map((t:any, idx:number) => (
                      <li key={idx} className="border-l-2 pl-3">
                        <div className="text-xs text-gray-500">{new Date(t.timestamp).toLocaleString()}</div>
                        <div className="font-medium">{t.status}{t.location ? ` — ${t.location}` : ''}</div>
                        {t.message && <div className="text-gray-600 text-sm">{t.message}</div>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500">No tracking updates yet.</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
