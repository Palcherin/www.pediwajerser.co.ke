import React from 'react';
import { Routes, Route } from 'react-router-dom';
import useCustomerTracker from './hooks/useCustomerTracker';

// import all your pages
import HomePage        from './pages/HomePage';
import ProductPage     from './pages/ProductPage';
import CheckoutPage    from './pages/CheckoutPage';
import CartPage        from './pages/CartPage';
// ... any other pages

const AppLayout = () => {
  useCustomerTracker(); // ✅ now safely inside <Router>

  return (
    <Routes>
      <Route path="/"          element={<HomePage />} />
      <Route path="/product/:slug" element={<ProductPage />} />
      <Route path="/checkout"  element={<CheckoutPage />} />
      <Route path="/cart"      element={<CartPage />} />
      {/* ... rest of your routes */}
    </Routes>
  );
};

export default AppLayout;