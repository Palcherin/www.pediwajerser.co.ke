import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cart`;
const LOCAL_KEY = 'cart';

// ⚠️ Change 'token' to whatever key your login flow stores the JWT under
const getToken = () => localStorage.getItem('token');

const readLocal = () => {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; }
  catch { return []; }
};
const writeLocal = (items) => localStorage.setItem(LOCAL_KEY, JSON.stringify(items));

// Same product + size + color + printing = same cart line (guest mode)
const lineKey = (i) =>
  [i.productId, i.size || '', i.color || '', JSON.stringify(i.printing || null)].join('|');

const request = async (path = '', options = {}) => {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Cart request failed');
  return data;
};

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Logged in  -> load from DB (merging any guest items first)
  // Logged out -> load from localStorage
  const loadCart = useCallback(async () => {
    if (!getToken()) {
      setCart(readLocal());
      return;
    }
    try {
      const guestItems = readLocal();
      for (const item of guestItems) {
        try {
          await request('/add', {
            method: 'POST',
            body: JSON.stringify({
              product_id: item.productId,
              quantity: item.quantity,
              size: item.size || undefined,
              color: item.color || undefined,
              printing: item.printing || undefined,
            }),
          });
        } catch (err) {
          console.error('Could not merge item', item.name, err.message); // e.g. out of stock
        }
      }
      if (guestItems.length) localStorage.removeItem(LOCAL_KEY);

      const data = await request();
      setCart(data.items);
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  }, []);

  useEffect(() => {
    loadCart().finally(() => setLoading(false));
  }, [loadCart]);

  // Guest helper: update state and localStorage together
  const commitLocal = (next) => {
    setCart(next);
    writeLocal(next);
  };

  const addToCart = async (product, quantity = 1) => {
    const item = {
      productId: product.productId || product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      size: product.size,
      color: product.color,
      printing: product.printing,
      quantity,
    };

    if (!getToken()) {
      const key = lineKey(item);
      const existing = cart.find(i => i.id === key);
      commitLocal(
        existing
          ? cart.map(i => (i.id === key ? { ...i, quantity: i.quantity + quantity } : i))
          : [...cart, { ...item, id: key }]
      );
      return;
    }

    try {
      await request('/add', {
        method: 'POST',
        body: JSON.stringify({
          product_id: item.productId,
          quantity,
          size: item.size || undefined,
          color: item.color || undefined,
          printing: item.printing || undefined,
        }),
      });
      await loadCart();
    } catch (err) {
      alert(err.message);
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return;
    const next = cart.map(i => (i.id === id ? { ...i, quantity } : i));

    if (!getToken()) return commitLocal(next);

    setCart(next); // optimistic
    try {
      await request(`/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) });
    } catch (err) {
      alert(err.message);
      loadCart(); // roll back to server state
    }
  };

  const removeFromCart = async (id) => {
    const next = cart.filter(i => i.id !== id);

    if (!getToken()) return commitLocal(next);

    setCart(next); // optimistic
    try {
      await request(`/${id}`, { method: 'DELETE' });
    } catch (err) {
      alert(err.message);
      loadCart();
    }
  };

  const clearCart = async () => {
    if (!getToken()) return commitLocal([]);

    setCart([]);
    try {
      await request('/clear', { method: 'DELETE' });
    } catch (err) {
      console.error(err);
      loadCart();
    }
  };

  const cartCount = cart.reduce((n, i) => n + i.quantity, 0);
  const cartTotal = cart.reduce((n, i) => n + (Number(i.price) || 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      cartTotal,
      total: cartTotal,          // CartPage reads `total`
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      refreshCart: loadCart,     // call after login/logout
      loading,
    }}>
      {children}
    </CartContext.Provider>
  );
};