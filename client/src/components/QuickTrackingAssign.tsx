import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface QuickTrackingAssignProps {
  orderId: string;
  onSuccess: () => void;
}

const CARRIERS = ['FedEx', 'UPS', 'DHL', 'Royal Mail', 'Parcelforce'];

const QuickTrackingAssign: React.FC<QuickTrackingAssignProps> = ({ orderId, onSuccess }) => {
  const [selectedCarrier, setSelectedCarrier] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAutoAssign = async (carrier?: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/orders/${orderId}/auto-assign-tracking${carrier ? `?carrier=${carrier}` : ''}`;
      
      const res = await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(`✓ Tracking assigned: ${res.data.order.trackingNumber}`);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign tracking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm">Auto-Assign Tracking</h4>
      
      <div className="flex gap-2">
        <select
          value={selectedCarrier}
          onChange={e => setSelectedCarrier(e.target.value)}
          className="flex-1 p-2 border rounded text-sm"
        >
          <option value="">Random Carrier</option>
          {CARRIERS.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={() => handleAutoAssign(selectedCarrier || undefined)}
          disabled={loading}
          className="px-3 py-2 bg-vita-primary text-white rounded text-sm hover:bg-[#004a44] disabled:opacity-50"
        >
          {loading ? 'Assigning...' : 'Assign'}
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Generates a realistic tracking number and notifies the customer via email/SMS.
      </p>
    </div>
  );
};

export default QuickTrackingAssign;
