import React, { useState, useEffect } from 'react';
import { IconPlus, IconEdit, IconTrash, IconCategory } from '@tabler/icons-react';

const API_BASE = 'http://localhost:5000/api';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setCategories(data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load categories');
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().trim().replace(/\s+/g, '-');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const payload = {
      name: form.name.trim(),
      slug: form.slug || generateSlug(form.name),
      description: form.description.trim(),
    };

    try {
      const url = editing 
        ? `${API_BASE}/categories/${editing}` 
        : `${API_BASE}/categories`;
      
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to save category');
        return;
      }

      setSuccess(editing ? 'Category updated!' : 'Category created successfully!');
      setShowForm(false);
      setForm({ name: '', slug: '', description: '' });
      setEditing(null);
      fetchCategories();
    } catch (err) {
      setError('Network error. Please make sure server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
    setEditing(category.id);
    setError('');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to delete');
        return;
      }

      setSuccess('Category deleted');
      fetchCategories();
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Categories</h2>
          <p className="text-gray-500 mt-1">Manage product categories</p>
        </div>
        <button
          onClick={() => {
            setForm({ name: '', slug: '', description: '' });
            setEditing(null);
            setError('');
            setSuccess('');
            setShowForm(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2"
        >
          <IconPlus size={20} />
          New Category
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-2xl">{success}</div>}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <IconCategory size={28} />
              </div>
              <div>
                <h3 className="font-semibold text-xl">{cat.name}</h3>
                <p className="text-sm text-gray-400">/{cat.slug}</p>
              </div>
            </div>

            {cat.description && (
              <p className="text-sm text-gray-500 mb-6 line-clamp-2">{cat.description}</p>
            )}

            <div className="flex gap-2">
              <button onClick={() => handleEdit(cat)}
                className="flex-1 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-2xl transition flex items-center justify-center gap-2">
                <IconEdit size={18} /> Edit
              </button>
              <button onClick={() => handleDelete(cat.id)}
                className="flex-1 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-2xl transition flex items-center justify-center gap-2">
                <IconTrash size={18} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6">
              {editing ? 'Edit Category' : 'Create New Category'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Retro Kits"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                  placeholder="retro-kits"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                  placeholder="Description of this category..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-4 rounded-2xl"
                >
                  {loading ? 'Saving...' : editing ? 'Update Category' : 'Create Category'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 py-4 rounded-2xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;