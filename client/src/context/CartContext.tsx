// /client/src/context/CartContext.tsx
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import type { Product } from '../types/Product';
import type { CartItem, CartContextType } from '../types/Cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Load cart items from local storage on initial load
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Persist cart items to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);


  const addToCart = (product: Product, quantity: number) => {
    const existingItem = cartItems.find(item => item.productId === product._id);

    if (existingItem) {
      // Update quantity if item exists
      setCartItems(
        cartItems.map(item =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      // Add new item
      const newItem: CartItem = {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.imageUrls[0],
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.productId !== id));
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(
      cartItems.map(item =>
        item.productId === id
          ? { ...item, quantity: quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate the total price of all items in the cart
  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);


  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};