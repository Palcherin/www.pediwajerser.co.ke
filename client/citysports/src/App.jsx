import { BrowserRouter, Routes, Route } from 'react-router-dom';
import useCustomerTracker from './hooks/useCustomerTracker';
import Footer from './Components/layout/Footer';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './Pages/auth/ProtectedRoutes.jsx';

import HomePage      from './Pages/Home/Home.jsx';
import CategoryPage  from './Pages/Categories/CategoryPage';
import NewSeason     from './Pages/Categories/NewSeason.jsx';
import CartPage      from './Pages/Cart/CartPage.jsx';
import CheckoutPage  from './Pages/Checkout/CheckoutPage.jsx';
import BlogPage      from './Pages/Blog/BlogPage.jsx';
import AdminDashboard from './Pages/Admin/AdminPage';
import ProductDetail from './Components/products/ProductDetails.jsx';
import LoginPage     from './Pages/auth/LoginPage.jsx';
import Navbar        from './Components/layout/Navbar.jsx';

// ✅ Separate inner component — lives inside <BrowserRouter>
const AppLayout = () => {
  useCustomerTracker(); // ✅ useLocation() works here

  return (
    <>
      <Navbar />

      <Routes>
        {/* Public routes */}
        <Route path='/'                      element={<HomePage />} />
        <Route path='/category/:slug'        element={<CategoryPage />} />
        <Route path='/categories/new-season' element={<NewSeason />} />
        <Route path='/product/:id'           element={<ProductDetail />} />
        <Route path='/cart'                  element={<CartPage />} />
        <Route path='/checkout'              element={<CheckoutPage />} />
        <Route path='/blogs'                 element={<BlogPage />} />
        <Route path='/login'                 element={<LoginPage />} />

        {/* Admin only */}
        <Route path='/admin' element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>

      <Footer />
    </>
  );
};

// ✅ App just provides the Router + context wrappers
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppLayout />  {/* ← tracker is inside Router now */}
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;