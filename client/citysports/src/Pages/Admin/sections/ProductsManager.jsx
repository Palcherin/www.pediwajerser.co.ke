import React, { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

const DEFAULT_CATEGORIES = [
  { slug: 'retro-kits',   name: 'Retro Kits',   description: 'Classic football jerseys from the golden eras',    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&q=80' },
  { slug: 'new-season',   name: 'New Season',   description: 'Latest kits and gear for the 2025/26 season',      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&q=80' },
  { slug: 'footwear',     name: 'Footwear',     description: 'Premium boots and trainers for every pitch',        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
  { slug: 'backpacks',    name: 'Backpacks',    description: 'Durable training and matchday bags',                image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80' },
  { slug: 'special-kits', name: 'Special Kits', description: 'Limited edition and special release kits',          image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&q=80' },
  { slug: 'others',       name: 'Others',       description: 'Other sports equipment and accessories',            image: 'https://images.unsplash.com/photo-1526976668912-3f65a7c6c8f3?w=400&q=80' },
];

const EMPTY_PRODUCT_FORM = {
  name: '', description: '', price: '', oldPrice: '',
  brand: '', categorySlug: '', stockQuantity: '',
  inStock: true, featured: false,
};

const EMPTY_CATEGORY_FORM = { name: '', description: '', image: '' };

const authFetch = (url, opts = {}) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${token()}`, ...opts.headers } });

const ProductsManager = () => {
  const [activeTab, setActiveTab]             = useState('products');

  // Products state
  const [products, setProducts]               = useState([]);
  const [productForm, setProductForm]         = useState(EMPTY_PRODUCT_FORM);
  const [imageFiles, setImageFiles]           = useState([]);
  const [imagePreviews, setImagePreviews]     = useState([]);
  const [editingProduct, setEditingProduct]   = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productLoading, setProductLoading]   = useState(false);
  const [productError, setProductError]       = useState('');

  // Categories state
  const [categories, setCategories]               = useState([]);
  const [categoryForm, setCategoryForm]           = useState(EMPTY_CATEGORY_FORM);
  const [editingCategory, setEditingCategory]     = useState(null);
  const [showCategoryForm, setShowCategoryForm]   = useState(false);
  const [categoryLoading, setCategoryLoading]     = useState(false);
  const [categoryError, setCategoryError]         = useState('');
  const [seeding, setSeeding]                     = useState(false);

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  // ── Fetch ────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      const res  = await authFetch(`${API}/products`);
      const data = await res.json();
      setProducts(data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const res    = await authFetch(`${API}/categories`);
      const data   = await res.json();
      const fetched = data.data || [];
      if (fetched.length > 0) {
        setCategories(fetched);
      } else {
        await seedDefaultCategories();
      }
    } catch (err) {
      console.error(err);
      setCategories(DEFAULT_CATEGORIES);
    }
  };

  const seedDefaultCategories = async () => {
    setSeeding(true);
    try {
      const results = await Promise.all(
        DEFAULT_CATEGORIES.map(cat =>
          authFetch(`${API}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: cat.name, description: cat.description, image: cat.image }),
          }).then(r => r.json())
        )
      );
      const created = results.map(r => r.data || r.success && r).filter(Boolean);
      // Re-fetch to get proper DB records with IDs
      const res  = await authFetch(`${API}/categories`);
      const data = await res.json();
      setCategories(data.data?.length > 0 ? data.data : DEFAULT_CATEGORIES);
    } catch (err) {
      console.error(err);
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setSeeding(false);
    }
  };

  // ── Product handlers ─────────────────────────────────────────────
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

const handleProductSubmit = async (e) => {
  e.preventDefault();
  setProductError('');
  
  if (!productForm.categorySlug) {
    setProductError('Please select a category');
    return;
  }

  setProductLoading(true);

  const fd = new FormData();
  fd.append('name', productForm.name);
  fd.append('description', productForm.description || '');
  fd.append('price', productForm.price);
  fd.append('oldPrice', productForm.oldPrice || '');
  fd.append('brand', productForm.brand || '');
  fd.append('categorySlug', productForm.categorySlug);
  fd.append('stockQuantity', productForm.stockQuantity || '0');
  fd.append('inStock', productForm.inStock ? 'true' : 'false');
  fd.append('featured', productForm.featured ? 'true' : 'false');

  // Append images
  imageFiles.forEach(file => fd.append('images', file));

  const url = editingProduct 
    ? `${API}/products/${editingProduct}` 
    : `${API}/products`;
  
  const method = editingProduct ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${token()}`,   // ← ONLY this header
        // DO NOT set Content-Type when using FormData
      },
      body: fd,
    });

    const data = await res.json();

    if (!res.ok) {
      setProductError(data.message || 'Failed to save product');
      return;
    }

    alert(editingProduct ? 'Product updated successfully!' : '✅ Product created successfully!');

    // Reset form
    setProductForm(EMPTY_PRODUCT_FORM);
    setImageFiles([]);
    setImagePreviews([]);
    setEditingProduct(null);
    setShowProductForm(false);
    
    fetchProducts();
  } catch (err) {
    console.error(err);
    setProductError('Network error. Please make sure the server is running.');
  } finally {
    setProductLoading(false);
  }
};

  const handleEditProduct = (p) => {
    setProductForm({
      name: p.name, description: p.description || '',
      price: p.price, oldPrice: p.oldPrice || '',
      brand: p.brand || '', categorySlug: p.categorySlug || '',
      stockQuantity: p.stockQuantity, inStock: p.inStock, featured: p.featured || false,
    });
    setImagePreviews(p.images || []);
    setImageFiles([]);
    setEditingProduct(p.id);
    setProductError('');
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    await authFetch(`${API}/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  // ── Category handlers ────────────────────────────────────────────
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setCategoryError('');
    setCategoryLoading(true);

    const url    = editingCategory ? `${API}/categories/${editingCategory}` : `${API}/categories`;
    const method = editingCategory ? 'PUT' : 'POST';

    try {
      const res  = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });
      const data = await res.json();
      if (!res.ok) { setCategoryError(data.message || 'Failed to save category'); return; }
      setCategoryForm(EMPTY_CATEGORY_FORM);
      setEditingCategory(null); setShowCategoryForm(false);
      fetchCategories();
    } catch (err) {
      setCategoryError(err.message);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleEditCategory = (cat) => {
    setCategoryForm({ name: cat.name, description: cat.description || '', image: cat.image || '' });
    setEditingCategory(cat.id);
    setCategoryError('');
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category? Products in this category may be affected.')) return;
    const res  = await authFetch(`${API}/categories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { alert(data.message); return; }
    fetchCategories();
  };

  const inp = 'w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors';

  return (
    <div className="p-8">

      {/* Tab switcher */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
          {['products', 'categories'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {tab}
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({tab === 'products' ? products.length : categories.length})
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            if (activeTab === 'products') {
              setProductForm(EMPTY_PRODUCT_FORM);
              setImageFiles([]); setImagePreviews([]);
              setEditingProduct(null); setProductError('');
              setShowProductForm(true);
            } else {
              setCategoryForm(EMPTY_CATEGORY_FORM);
              setEditingCategory(null); setCategoryError('');
              setShowCategoryForm(true);
            }
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-semibold text-sm transition"
        >
          + Add {activeTab === 'products' ? 'Product' : 'Category'}
        </button>
      </div>

      {/* ── PRODUCTS TAB ──────────────────────────────────────────── */}
      {activeTab === 'products' && (
        <>
          {showProductForm && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-6">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>

                {productError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl mb-4">
                    {productError}
                  </div>
                )}

                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                      <input value={productForm.name} required placeholder="e.g. Manchester United 2025/26 Kit"
                        onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} className={inp} />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea value={productForm.description} rows={3}
                        onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                        className={`${inp} resize-none`} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (KSh)</label>
                      <input type="number" value={productForm.price} required
                        onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} className={inp} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Old Price (KSh)</label>
                      <input type="number" value={productForm.oldPrice}
                        onChange={e => setProductForm(f => ({ ...f, oldPrice: e.target.value }))} className={inp} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                      <input value={productForm.brand} placeholder="e.g. Nike, Adidas"
                        onChange={e => setProductForm(f => ({ ...f, brand: e.target.value }))} className={inp} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                      <input type="number" value={productForm.stockQuantity}
                        onChange={e => setProductForm(f => ({ ...f, stockQuantity: e.target.value }))} className={inp} />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      {seeding ? (
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded-2xl">
                          Setting up default categories...
                        </div>
                      ) : categories.length === 0 ? (
                        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-2xl">
                          No categories yet — switch to the Categories tab and create one first.
                        </div>
                      ) : (
                        <select value={productForm.categorySlug} required
                          onChange={e => setProductForm(f => ({ ...f, categorySlug: e.target.value }))}
                          className={inp}>
                          <option value="">Select category...</option>
                          {categories.map(cat => (
                            <option key={cat.id || cat.slug} value={cat.slug}>{cat.name}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                      <input type="file" multiple accept="image/*" onChange={handleImageSelect}
                        className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-50 file:text-emerald-700 file:text-xs" />
                      {imagePreviews.length > 0 && (
                        <div className="flex gap-3 mt-3 flex-wrap">
                          {imagePreviews.map((src, i) => (
                            <img key={i} src={src} alt={`preview-${i}`}
                              className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="col-span-2 flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={productForm.inStock}
                          onChange={e => setProductForm(f => ({ ...f, inStock: e.target.checked }))}
                          className="accent-emerald-600 w-4 h-4" />
                        <span className="text-sm font-medium text-gray-700">In Stock</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={productForm.featured}
                          onChange={e => setProductForm(f => ({ ...f, featured: e.target.checked }))}
                          className="accent-emerald-600 w-4 h-4" />
                        <span className="text-sm font-medium text-gray-700">Featured</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={productLoading}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-4 rounded-2xl transition">
                      {productLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                    </button>
                    <button type="button" onClick={() => { setShowProductForm(false); setProductError(''); }}
                      className="flex-1 border border-gray-200 hover:bg-gray-50 font-semibold py-4 rounded-2xl transition text-gray-600">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            {products.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg font-medium">No products yet</p>
                <p className="text-sm mt-1">Click "Add Product" to get started</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Product','Category','Price','Stock','Status',''].map((h, i) => (
                      <th key={i} className={`px-6 py-4 text-gray-500 font-medium ${h ? 'text-left' : 'text-right'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={p.images?.[0] || 'https://placehold.co/48'} alt={p.name}
                            className="w-12 h-12 object-cover rounded-xl bg-gray-100 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                            {p.featured && <span className="text-xs text-emerald-600 font-medium">Featured</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 capitalize">{p.categorySlug?.replace(/-/g, ' ')}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">KSh {p.price?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-600">{p.stockQuantity}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${p.inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                          {p.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleEditProduct(p)}
                          className="text-xs text-blue-500 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition mr-2">Edit</button>
                        <button onClick={() => handleDeleteProduct(p.id)}
                          className="text-xs text-red-400 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ── CATEGORIES TAB ────────────────────────────────────────── */}
      {activeTab === 'categories' && (
        <>
          {seeding && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded-2xl mb-6 flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Setting up default categories...
            </div>
          )}

          {showCategoryForm && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-8 w-full max-w-md">
                <h3 className="text-xl font-bold mb-6">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>

                {categoryError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl mb-4">
                    {categoryError}
                  </div>
                )}

                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                    <input value={categoryForm.name} required placeholder="e.g. Footwear"
                      onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))} className={inp} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={categoryForm.description} rows={3}
                      placeholder="Short description of this category..."
                      onChange={e => setCategoryForm(f => ({ ...f, description: e.target.value }))}
                      className={`${inp} resize-none`} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input value={categoryForm.image} placeholder="https://..."
                      onChange={e => setCategoryForm(f => ({ ...f, image: e.target.value }))} className={inp} />
                    {categoryForm.image && (
                      <img src={categoryForm.image} alt="preview"
                        className="mt-2 w-full h-32 object-cover rounded-2xl border border-gray-200" />
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={categoryLoading}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-4 rounded-2xl transition">
                      {categoryLoading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                    </button>
                    <button type="button" onClick={() => { setShowCategoryForm(false); setCategoryError(''); }}
                      className="flex-1 border border-gray-200 hover:bg-gray-50 font-semibold py-4 rounded-2xl transition text-gray-600">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.length === 0 && !seeding ? (
              <div className="col-span-3 text-center py-16 text-gray-400 bg-white rounded-3xl border border-gray-100">
                <p className="text-lg font-medium">No categories yet</p>
                <p className="text-sm mt-1">Click "Add Category" to create your first one</p>
              </div>
            ) : (
              categories.map((cat, i) => (
                <div key={cat.id || cat.slug || i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-md transition">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center text-4xl">
                      🗂️
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900">{cat.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{cat.slug}</p>
                    {cat.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{cat.description}</p>
                    )}
                    <p className="text-xs text-emerald-600 font-medium mt-2">
                      {products.filter(p => p.categorySlug === cat.slug).length} products
                    </p>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => handleEditCategory(cat)}
                        className="flex-1 text-xs text-blue-500 hover:text-blue-700 font-medium py-2 rounded-xl hover:bg-blue-50 transition border border-blue-100">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteCategory(cat.id)}
                        className="flex-1 text-xs text-red-400 hover:text-red-600 font-medium py-2 rounded-xl hover:bg-red-50 transition border border-red-100">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductsManager;