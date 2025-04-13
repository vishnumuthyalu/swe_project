import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  
  // Clear cart on page reload
  useEffect(() => {
    // Initialize the cart with an empty array
    setCartItems([]);
  }, []);
  
  // Add item to cart
  const addToCart = (product) => {
    // Check if product already exists in cart
    const existingItemIndex = cartItems.findIndex(
      (item) => item.ProductID === product.ProductID
    );
    
    if (existingItemIndex >= 0) {
      // Product exists, update quantity
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += 1;
      setCartItems(updatedCart);
    } else {
      // Product doesn't exist, add new item
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };
  
  // Remove item from cart
  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter(item => item.ProductID !== productId);
    setCartItems(updatedCart);
  };
  
  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const updatedCart = cartItems.map(item => 
      item.ProductID === productId ? { ...item, quantity } : item
    );
    
    setCartItems(updatedCart);
  };
  
  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + parseFloat(item.Price) * item.quantity, 
      0
    ).toFixed(2);
  };
  
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        calculateTotal,
        cartCount: cartItems.reduce((count, item) => count + item.quantity, 0)
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
