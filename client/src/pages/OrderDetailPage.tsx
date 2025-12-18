import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

import { formatNaira } from '../utils/currency';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Admin tracking moved to Admin Dashboard — local tracking inputs were removed to centralize admin workflow.


  useEffect(() => {
    (async () => {
      if (!user || !id) return;
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setOrder(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to fetch order');
      } finally {
        setLoading(false);
      }
    })();
  }, [user, id]);

  if (!user) return <div className="p-8">Please login to view order details.</div>;

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!order) return <div className="p-8">No order found.</div>;



  return (
    <div className="container mx-auto p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Order #{order._id}</h2>
          <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</span>
        </div>

        <div className="mb-4 grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Status: <strong className="text-vita-primary">{order.trackingStatus || order.orderStatus}</strong></div>
            <div className="text-sm text-gray-600">Total: <strong>{formatNaira(order.totalAmount)}</strong></div>

            {order.trackingNumber && (
              <div className="mt-2 text-sm">
                <div>Tracking #: <span className="font-medium">{order.trackingNumber}</span> <button onClick={() => { navigator.clipboard?.writeText(order.trackingNumber); (async()=> (await import('react-hot-toast')).default.success('Copied'))(); }} className="ml-3 text-xs text-vita-primary">Copy</button></div>
                {order.carrier && <div className="text-xs text-gray-500">Carrier: {order.carrier}</div>}
                {order.trackingUrl && <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="text-sm text-vita-primary hover:underline">Track on carrier site</a>}
              </div>
            )}

            <div className="mt-3">
              <button onClick={async () => { setLoading(true); try { const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/${id}`, { headers: { Authorization: `Bearer ${user.token}` } }); setOrder(res.data); } catch (err:any) { setError(err.response?.data?.message || 'Unable to refresh'); } finally { setLoading(false); } }} className="px-3 py-1 bg-gray-100 rounded text-sm">Refresh</button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="text-sm font-semibold mb-2">Tracking</h4>
            {order.trackingHistory && order.trackingHistory.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {[...order.trackingHistory].reverse().map((t:any, idx:number) => (
                  <li key={idx} className="border-l-2 border-emerald-100 pl-3">
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
        </div>

        <div className="space-y-3">
          {order.orderItems.map((item: any) => (
            <div key={item.productId} className="flex items-center gap-4 border p-3 rounded">
              <div className="flex-1">
                <div className="font-medium">{item.name} x {item.quantity}</div>
                <div className="text-sm text-gray-500">{formatNaira(item.price)}</div>
              </div>
              <div className="text-right font-semibold">{formatNaira(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>

        {/* Admin controls moved to Admin Dashboard */}
        {user?.role === 'admin' && (
          <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm">
            Admin actions for assigning and bulk-managing tracking have been moved to the <strong>Admin Dashboard → View Orders</strong> for centralized management.
          </div>
        )}

        <div className="mt-6 text-right">
          <Link to="/orders" className="text-sm text-vita-primary hover:underline">Back to Orders</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
