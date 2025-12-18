// /client/src/pages/CartPage.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/currency';

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateCartQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 my-8">
      <h1 className="text-4xl font-extrabold text-vita-primary mb-10 border-b pb-4">
        Shopping Cart ({cartItems.length} Items)
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center p-10 bg-gray-100 rounded-lg">
          <p className="text-xl text-gray-600">Your cart is currently empty.</p>
          <Link to="/products" className="mt-4 inline-block text-vita-secondary font-bold hover:underline">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map(item => (
              <div key={item.productId} className="flex items-center bg-white p-4 rounded-xl shadow-md">
                
                {/* Image */}
                <img 
                  src={item.image || 'https://via.placeholder.com/80x80.png?text=Item'} 
                  alt={item.name} 
                  className="w-20 h-20 object-cover rounded-lg mr-4"
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.productId}`} className="text-lg font-semibold text-vita-text hover:text-vita-primary transition-colors">
                    {item.name}
                  </Link>
                  <p className="text-gray-500">Price: {formatNaira(item.price)}</p>
                </div>
                
                {/* Quantity Selector */}
                <div className="flex items-center space-x-4 mx-6">
                  <label htmlFor={`qty-${item.productId}`} className="sr-only">Quantity</label>
                  <input
                    id={`qty-${item.productId}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateCartQuantity(item.productId, Number(e.target.value))}
                    className="w-16 p-2 border rounded-lg text-center"
                  />
                </div>

                {/* Subtotal & Remove */}
                <div className="text-right">
                  <p className="text-xl font-bold text-vita-primary">
                    {formatNaira(item.price * item.quantity)}
                  </p>
                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    className="text-sm text-red-600 hover:text-red-800 mt-1 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8">
              <h2 className="text-2xl font-bold border-b pb-3 mb-4 text-vita-text">Order Summary</h2>
              
              <div className="flex justify-between text-lg font-medium py-1">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>{formatNaira(cartTotal)}</span>
              </div>
              
              <div className="flex justify-between text-lg font-medium py-1">
                <span>Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              
              <div className="flex justify-between text-2xl font-extrabold text-vita-primary pt-3 border-t mt-4">
                <span>Order Total</span>
                <span>{formatNaira(cartTotal)}</span>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full mt-6 py-3 text-lg font-bold text-white bg-vita-secondary rounded-lg hover:bg-[#ffb000] transition-colors shadow-md"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;