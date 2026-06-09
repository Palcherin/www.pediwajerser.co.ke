import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaWhatsapp, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';

const API = 'http://localhost:5000/api';

const PRINTING_OPTIONS = [
  { value: 'none',        label: 'No Printing',    price: 0   },
  { value: 'name',        label: 'Name Only',       price: 200 },
  { value: 'name-number', label: 'Name & Number',   price: 400 },
];

// ── Image URL helper ─────────────────────────────────────────────
const getImageUrl = (path) => {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('http')) return path;
  return `http://localhost:5000${path}`;
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product,     setProduct]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [quantity,    setQuantity]    = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [printOption,  setPrintOption]  = useState('none');
  const [printName,    setPrintName]    = useState('');
  const [printNumber,  setPrintNumber]  = useState('');
  const [sizeError,    setSizeError]    = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data.data);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ── Loading state ──────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading product...</p>
      </div>
    </div>
  );

  // ── Error state ────────────────────────────────────────────────
  if (error || !product) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl text-gray-500 mb-4">Product not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-emerald-600 hover:text-emerald-700 font-semibold"
        >
          ← Go back
        </button>
      </div>
    </div>
  );

  // ── Derived values ─────────────────────────────────────────────
  const images = Array.isArray(product.images) && product.images.length
    ? product.images
    : [];

  const discount = product.discount ||
    (product.oldPrice
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0);

  const isKit = product.categorySlug === 'new-season' ||
                product.categorySlug === 'retro-kits';

  const printPrice = PRINTING_OPTIONS.find(o => o.value === printOption)?.price || 0;
  const unitPrice  = product.price + printPrice;
  const totalPrice = unitPrice * quantity;

  const buildWhatsappMessage = () => {
    let msg = `Hi! I'd like to order *${product.name}* (x${quantity})`;
    if (selectedSize) msg += `, Size: ${selectedSize}`;
    if (printOption !== 'none') {
      msg += `, Printing: ${PRINTING_OPTIONS.find(o => o.value === printOption)?.label}`;
      if (printName)  msg += ` — Name: ${printName}`;
      if (printOption === 'name-number' && printNumber) msg += `, Number: ${printNumber}`;
    }
    msg += `. Total: KSh ${totalPrice.toLocaleString()}. Is it available?`;
    return msg;
  };

  const whatsappUrl = `https://wa.me/254743666719?text=${encodeURIComponent(buildWhatsappMessage())}`;

  const handleBuyNow = () => {
    if (product.sizes?.length > 1 && !selectedSize) {
      setSizeError(true);
      return;
    }
    addToCart({
      id:       product.id,
      name:     product.name,
      image:    images[0] ? getImageUrl(images[0]) : '/placeholder.jpg',
      price:    unitPrice,
      quantity,
      size:     selectedSize,
      printing: printOption !== 'none'
        ? { type: printOption, name: printName, number: printNumber }
        : null,
    });
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-8 transition-colors"
        >
          <FaArrowLeft /> Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-3xl p-8 shadow-sm">

          {/* ── Images ── */}
          <div>
            <div className="rounded-2xl overflow-hidden bg-gray-100 h-96">
              {images.length > 0 ? (
                <img
                  src={getImageUrl(images[activeImage])}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.src = '/placeholder.jpg'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 mt-4 flex-wrap">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      i === activeImage ? 'border-emerald-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={e => { e.target.src = '/placeholder.jpg'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details ── */}
          <div className="flex flex-col gap-6">

            {/* Title & Price */}
            <div>
              {discount > 0 && (
                <span className="inline-block bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full mb-3">
                  -{discount}% OFF
                </span>
              )}
              <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-gray-900">
                  KSh {product.price.toLocaleString()}
                </span>
                {product.oldPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    KSh {product.oldPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {product.description && (
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            )}

            {/* Size Selector */}
            {product.sizes?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800">
                    Size {selectedSize && <span className="text-emerald-600 ml-1">— {selectedSize}</span>}
                  </span>
                  {sizeError && <span className="text-red-500 text-sm">Please select a size</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                        selectedSize === size
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Printing Options */}
            {isKit && (
              <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
                <p className="font-semibold text-gray-800 mb-3">
                  Personalisation <span className="text-gray-400 font-normal text-sm">(optional)</span>
                </p>
                <div className="flex flex-col gap-2 mb-4">
                  {PRINTING_OPTIONS.map(option => (
                    <label
                      key={option.value}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                        printOption === option.value
                          ? 'border-emerald-500 bg-white'
                          : 'border-transparent bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="printing"
                          value={option.value}
                          checked={printOption === option.value}
                          onChange={() => setPrintOption(option.value)}
                          className="accent-emerald-600"
                        />
                        <span className="text-sm font-medium text-gray-700">{option.label}</span>
                      </div>
                      {option.price > 0 && (
                        <span className="text-sm font-semibold text-emerald-600">
                          +KSh {option.price}
                        </span>
                      )}
                    </label>
                  ))}
                </div>

                {printOption !== 'none' && (
                  <div className="flex flex-col gap-3 mt-2">
                    <input
                      type="text"
                      placeholder="Name to print (e.g. SALAH)"
                      value={printName}
                      onChange={e => setPrintName(e.target.value.toUpperCase())}
                      maxLength={15}
                      className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 uppercase"
                    />
                    {printOption === 'name-number' && (
                      <input
                        type="number"
                        placeholder="Number (e.g. 11)"
                        value={printNumber}
                        onChange={e => setPrintNumber(e.target.value)}
                        min={1} max={99}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 w-36"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">Quantity</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition text-lg font-medium">−</button>
                <span className="px-5 py-2 font-semibold text-gray-900">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition text-lg font-medium">+</button>
              </div>
            </div>

            {/* Price summary */}
            {printPrice > 0 && (
              <div className="text-sm text-gray-500 -mt-3 pl-1 space-y-0.5">
                <div>Kit: KSh {product.price.toLocaleString()} × {quantity}</div>
                <div>Printing: KSh {printPrice.toLocaleString()} × {quantity}</div>
                <div className="font-semibold text-gray-700 pt-1 border-t border-gray-100">
                  Total: KSh {totalPrice.toLocaleString()}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleBuyNow}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-lg shadow-sm"
              >
                <FaShoppingCart />
                Buy Now — KSh {totalPrice.toLocaleString()}
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba5c] text-white font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-lg"
              >
                <FaWhatsapp className="text-xl" />
                Order via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;