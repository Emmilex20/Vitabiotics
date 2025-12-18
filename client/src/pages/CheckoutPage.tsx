// /client/src/pages/CheckoutPage.tsx
import React, { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatNaira } from '../utils/currency';
import { handlePaystackPayment, initializePaystack, verifyPaystackPayment } from '../utils/paystack';
import axios from 'axios';

const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({ street: '', city: '', postalCode: '', country: 'Nigeria' });
  const [paymentMethod, setPaymentMethod] = useState('Paystack');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paystackReady, setPaystackReady] = useState(false);

  // Initialize Paystack on component mount
  useEffect(() => {
    (async () => {
      try {
        const initResult = await initializePaystack();
        setPaystackReady(!!(initResult?.loadedScript && initResult?.keyOk));
      } catch (err) {
        console.warn('Paystack script failed to load', err);
        setPaystackReady(false);
      }
    })();
  }, []);

  if (!user) {
    navigate('/login?redirect=/checkout'); // Redirect unauthenticated users
    return null;
  }
  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Convert cart items to the IOrderItem structure required by the backend
    const orderItemsPayload = cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
    }));

    try {
      const token = user.token;
      
      if (paymentMethod === 'Paystack') {
        // Ensure Paystack is ready
        if (!paystackReady) {
          setError('Paystack is not initialized. Please contact support or try a different payment method.');
          setLoading(false);
          return;
        }

        // Handle Paystack payment
        const paystackResponse = await handlePaystackPayment({
          email: (user as any).email || '',
          amount: cartTotal,
          firstName: (user as any).firstName || '',
          lastName: (user as any).lastName || '',
          metadata: {
            orderId: Math.random().toString(36).substr(2, 9),
          },
        });

        if (paystackResponse.status === 'success') {
          // Verify payment with backend
          const verifyResponse = await verifyPaystackPayment(paystackResponse.reference, token);
          
          if (verifyResponse.success) {
            // Create order after successful payment
            const config = {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            };

            const orderData = {
              orderItems: orderItemsPayload,
              shippingAddress: shipping,
              paymentMethod: 'Paystack',
              totalAmount: cartTotal,
              paystackReference: paystackResponse.reference,
            };

            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, orderData, config);
            clearCart();
            navigate('/order-success');
          } else {
            setError('Payment verification failed. Please contact support.');
          }
        } else {
          setError('Payment was not completed. Please try again.');
        }
      } else {
        // Handle other payment methods (placeholder)
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        };

        const orderData = {
          orderItems: orderItemsPayload,
          shippingAddress: shipping,
          paymentMethod: paymentMethod,
          totalAmount: cartTotal,
        };

        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, orderData, config);
        clearCart();
        navigate('/order-success');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Order failed. Please check stock and details.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 my-8">
      <h1 className="text-4xl font-extrabold text-vita-primary mb-10 border-b pb-4">
        Checkout
      </h1>

      {error && (
        <div className="p-4 mb-4 text-sm font-medium text-red-700 bg-red-100 rounded-lg">{error}</div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Shipping Details */}
        <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-vita-text">1. Shipping Information</h2>
          <div className="space-y-4">
            <input type="text" name="street" value={shipping.street} onChange={handleShippingChange} placeholder="Street Address" required className="w-full p-3 border rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" name="city" value={shipping.city} onChange={handleShippingChange} placeholder="City" required className="w-full p-3 border rounded-lg" />
              <input type="text" name="postalCode" value={shipping.postalCode} onChange={handleShippingChange} placeholder="Postal Code" required className="w-full p-3 border rounded-lg" />
            </div>
            <select name="country" value={shipping.country} onChange={handleShippingChange} required className="w-full p-3 border rounded-lg">
                <option value="Nigeria">Nigeria</option>
                <option value="Ghana">Ghana</option>
                <option value="Kenya">Kenya</option>
            </select>
          </div>
          
          <h2 className="text-2xl font-bold text-vita-text pt-4 border-t">2. Payment Method</h2>
          <div className="space-y-2">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="paymentMethod" value="Paystack" checked={paymentMethod === 'Paystack'} onChange={() => setPaymentMethod('Paystack')} className="form-radio text-vita-primary" disabled={!paystackReady} />
                <span className="ml-3 font-medium">💳 Paystack (Debit/Credit Card)</span>
                {!paystackReady && <span className="ml-4 text-xs text-red-600">(Paystack not initialized)</span>}
            </label>
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="paymentMethod" value="BankTransfer" checked={paymentMethod === 'BankTransfer'} onChange={() => setPaymentMethod('BankTransfer')} className="form-radio text-vita-primary" />
                <span className="ml-3 font-medium">🏦 Bank Transfer</span>
            </label>
          </div>

        </div>

        {/* Column 2: Order Summary and Submission */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8">
            <h2 className="text-2xl font-bold border-b pb-3 mb-4 text-vita-text">Summary</h2>
            
            {cartItems.map(item => (
                <div key={item.productId} className="flex justify-between text-sm py-1 border-b border-dashed">
                    <span className="text-gray-600 line-clamp-1">{item.name} ({item.quantity})</span>
                    <span>{formatNaira(item.price * item.quantity)}</span>
                </div>
            ))}

            <div className="flex justify-between text-xl font-extrabold text-vita-primary pt-3 border-t mt-4">
              <span>Grand Total</span>
              <span>{formatNaira(cartTotal)}</span>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full mt-6 py-3 text-lg font-bold text-white rounded-lg transition-colors shadow-md ${
                loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-vita-secondary hover:bg-[#ffb000]'
              }`}
            >
              {loading ? 'Processing Order...' : `Place Order (${formatNaira(cartTotal)})`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;