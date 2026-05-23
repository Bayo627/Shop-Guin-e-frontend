import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('sg_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('sg_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product_id === product.id);
      
      if (existingItem) {
        // Mettre à jour la quantité tout en respectant le stock si physique
        const newQuantity = existingItem.quantity + quantity;
        if (product.type === 'physical' && newQuantity > product.stock) {
          alert(`Désolé, stock insuffisant. Stock disponible : ${product.stock}`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product_id === product.id ? { ...item, quantity: newQuantity } : item
        );
      }

      // Ajouter le nouvel article
      return [
        ...prevCart,
        {
          product_id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          image_url: product.image_url,
          type: product.type,
          seller_id: product.seller_id,
          store_name: product.store_name,
          quantity
        }
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product_id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product_id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
