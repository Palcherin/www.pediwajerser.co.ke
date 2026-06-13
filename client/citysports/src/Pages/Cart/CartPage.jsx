import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FaTrash, FaPlus, FaMinus, FaShoppingBag } from 'react-icons/fa';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://localhost:5000${path}`;
};

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, total, loading } = useCart();
  const navigate = useNavigate();

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!cart.length) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaShoppingBag className="text-gray-400 text-4xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-8">Browse our products and add something you love.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-semibold transition"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-white border-b border-gray-100 py-5 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Shopping Cart
            <span className="ml-2 text-base font-normal text-gray-400">
              ({cart.length} item{cart.length > 1 ? 's' : ''})
            </span>
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-400 hover:text-red-600 transition font-medium"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

        {/* Cart Items */}
        <div className="space-y-4">
          {cart.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-gray-100 p-5 flex gap-5 items-start hover:shadow-md transition-shadow"
            >
              <img
                src={getImageUrl(item.image) || 'https://placehold.co/96?text=No+Image'}
                alt={item.name}
                className="w-24 h-24 rounded-2xl object-cover bg-gray-100 flex-shrink-0"
                onError={e => { e.target.src = 'https://placehold.co/96?text=No+Image'; }}
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2">{item.name}</h3>

                <div className="flex flex-wrap gap-2 mt-1.5">
                  {item.size && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      Size: {item.size}
                    </span>
                  )}
                  {item.printing?.name && (
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      {item.printing.name}{item.printing.number ? ` #${item.printing.number}` : ''}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-2 text-gray-500 hover:bg-gray-100 transition"
                    >
                      <FaMinus className="text-xs" />
                    </button>
                    <span className="px-4 py-2 text-sm font-semibold text-gray-900 min-w-[36px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-2 text-gray-500 hover:bg-gray-100 transition"
                    >
                      <FaPlus className="text-xs" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900">
                      KSh {((item.price ?? 0) * (item.quantity ?? 0)).toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-300 hover:text-red-500 transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sticky top-6">
            <h2 className="font-bold text-gray-900 text-lg mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-gray-500">
                  <span className="line-clamp-1 flex-1 mr-2">{item.name} × {item.quantity}</span>
                  <span className="flex-shrink-0">KSh {((item.price ?? 0) * (item.quantity ?? 0)).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-5 pt-5 flex justify-between font-bold text-gray-900 text-base">
              <span>Subtotal</span>
              <span>KSh {(total ?? 0).toLocaleString()}</span>
            </div>

            <p className="text-xs text-gray-400 mt-2 mb-6">
              Delivery fee calculated at checkout based on your location.
            </p>

            <Link
              to="/checkout"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center text-base transition-all"
            >
              Proceed to Checkout
            </Link>

            <button
              onClick={() => navigate(-1)}
              className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition text-center"
            >
              ← Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;