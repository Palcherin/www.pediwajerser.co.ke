import React, { useState } from 'react';
import { FaWhatsapp, FaShoppingCart, FaCheck } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

// ✅ Resolves relative /uploads/... paths to full server URL
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://localhost:5000${path}`;
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  // ✅ Use images array, fall back gracefully
  const firstImage = Array.isArray(product.images) && product.images.length
    ? getImageUrl(product.images[0])
    : product.image
      ? getImageUrl(product.image)
      : null;

  // ✅ Only calculate discount if oldPrice exists and is greater than price
  const discount = product.discount ||
    (product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0);

  const handleWhatsApp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const msg = encodeURIComponent(
      `Hi! I'm interested in buying *${product.name}* for KSh ${product.price.toLocaleString()}. Is it available?`
    );
    window.open(`https://wa.me/254743666719?text=${msg}`, '_blank');
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id:       product.id,
      name:     product.name,
      image:    firstImage,
      images:   product.images || [],
      price:    product.price,
      quantity: 1,
    });
    navigate('/checkout');
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id:       product.id,
      name:     product.name,
      image:    firstImage,
      images:   product.images || [],
      price:    product.price,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link to={`/product/${product.id}`} className="block group">
      <div className="bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">

        {/* Image */}
        <div className="relative overflow-hidden bg-gray-100">
          {firstImage ? (
            <img
              src={firstImage}
              alt={product.name}
              className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105"
              onError={e => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Fallback placeholder */}
          <div
            className="w-full h-72 items-center justify-center text-gray-300 text-sm"
            style={{ display: firstImage ? 'none' : 'flex' }}
          >
            No image
          </div>

          {discount > 0 && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-2xl shadow">
              -{discount}%
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-5">
          <h3 className="font-semibold text-lg leading-tight text-gray-900 line-clamp-2 min-h-[52px]">
            {product.name}
          </h3>

          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <span className="text-2xl font-bold text-gray-900">
              KSh {product.price.toLocaleString()}
            </span>
            {/* ✅ Only show oldPrice if it exists */}
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-lg text-gray-400 line-through">
                KSh {product.oldPrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={handleBuyNow}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
            >
              <FaShoppingCart className="text-lg" />
              Buy Now
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className={`flex-1 border-2 font-semibold py-3 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 text-sm active:scale-[0.98] ${
                  added
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                    : 'border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600'
                }`}
              >
                {added ? <><FaCheck className="text-sm" /> Added!</> : <><FaShoppingCart className="text-sm" /> Add to Cart</>}
              </button>

              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center w-14 bg-[#25D366] hover:bg-[#20ba5c] text-white rounded-2xl transition-all duration-200"
                title="Order via WhatsApp"
              >
                <FaWhatsapp className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;