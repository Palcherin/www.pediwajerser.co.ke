import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EMPTY_FORM = {
  title: '',
  excerpt: '',
  content: '',
  image: '',
  category: '',
  author: '',
  featured: false,
  published: true,
};

const FALLBACK_IMAGE = 'https://placehold.co/160x120?text=No+image';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

const inputClass =
  'w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all';

const BlogManager = () => {
  const auth = useAuth();
  // Uses the token from AuthContext if it exposes one, otherwise falls back to localStorage.
  // ADJUST the localStorage key if your AuthContext stores it under a different name.
  const token = auth?.token || localStorage.getItem('token');

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | published | draft

  const [modal, setModal] = useState({ open: false, editingId: null, loadingPost: false });
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const request = useCallback(
    async (path, options = {}) => {
      const response = await fetch(`${API_URL}/api/blogs${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        throw new Error(json.message || 'Not authorised. Please sign in again as an admin.');
      }
      if (!response.ok || json.success === false) {
        throw new Error(json.message || `Request failed (${response.status})`);
      }
      return json;
    },
    [token]
  );

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const json = await request('/admin/all');
      setPosts(json.data);
    } catch (err) {
      setError(err.message || 'Cannot connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const categories = useMemo(() => [...new Set(posts.map((p) => p.category))].sort(), [posts]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return posts.filter((p) => {
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'published' ? p.published : !p.published);
      const matchesSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [posts, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: posts.length,
      published: posts.filter((p) => p.published).length,
      drafts: posts.filter((p) => !p.published).length,
    }),
    [posts]
  );

  // ---------- Modal ----------
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setModal({ open: true, editingId: null, loadingPost: false });
  };

  const openEdit = async (post) => {
    setForm(EMPTY_FORM);
    setFormError('');
    setModal({ open: true, editingId: post.id, loadingPost: true });
    try {
      // The list endpoint omits `content`, so fetch the full post
      const json = await request(`/admin/${post.id}`);
      const p = json.data;
      setForm({
        title: p.title || '',
        excerpt: p.excerpt || '',
        content: p.content || '',
        image: p.image || '',
        category: p.category || '',
        author: p.author || '',
        featured: !!p.featured,
        published: !!p.published,
      });
      setModal({ open: true, editingId: post.id, loadingPost: false });
    } catch (err) {
      setModal({ open: false, editingId: null, loadingPost: false });
      showToast(err.message, 'error');
    }
  };

  const closeModal = () => {
    if (saving) return;
    setModal({ open: false, editingId: null, loadingPost: false });
  };

  const setField = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    const required = ['title', 'excerpt', 'content', 'image', 'category'];
    const missing = required.find((k) => !form[k].trim());
    if (missing) {
      setFormError(`Please fill in the ${missing} field.`);
      return;
    }

    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content,
      image: form.image.trim(),
      category: form.category.trim(),
      featured: form.featured,
      published: form.published,
    };
    if (form.author.trim()) payload.author = form.author.trim();

    setSaving(true);
    try {
      if (modal.editingId) {
        await request(`/${modal.editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
        showToast('Post updated');
      } else {
        await request('', { method: 'POST', body: JSON.stringify(payload) });
        showToast('Post created');
      }
      setModal({ open: false, editingId: null, loadingPost: false });
      await loadPosts();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Quick actions ----------
  const quickUpdate = async (post, changes) => {
    setBusyId(post.id);
    try {
      await request(`/${post.id}`, { method: 'PUT', body: JSON.stringify(changes) });
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === post.id) return { ...p, ...changes };
          if (changes.featured) return { ...p, featured: false }; // only one featured post
          return p;
        })
      );
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await request(`/${confirmDelete.id}`, { method: 'DELETE' });
      setPosts((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      showToast('Post deleted');
      setConfirmDelete(null);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <p className="text-emerald-600 text-xs font-bold tracking-[0.25em] uppercase mb-2">
              Admin
            </p>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">Blog Manager</h1>
            <p className="text-gray-500 text-sm mt-1">
              {stats.total} posts · {stats.published} published · {stats.drafts} drafts
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-2xl transition-all text-sm"
          >
            + New Post
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or category..."
            className={`${inputClass} bg-white sm:max-w-sm`}
          />
          <div className="flex gap-2">
            {['all', 'published', 'draft'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition-all ${
                  statusFilter === s
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                {s === 'draft' ? 'Drafts' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : error ? (
            <div className="py-20 text-center px-4">
              <h3 className="text-2xl font-bold text-gray-300">Couldn't load posts</h3>
              <p className="mt-2 text-gray-400 text-sm">{error}</p>
              <button
                onClick={loadPosts}
                className="mt-6 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <h3 className="text-2xl font-bold text-gray-300">No posts found</h3>
              <p className="mt-2 text-gray-400 text-sm">
                {posts.length === 0 ? 'Create your first post.' : 'Try another search or filter.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                    <th className="px-6 py-4 font-semibold">Post</th>
                    <th className="px-4 py-4 font-semibold">Category</th>
                    <th className="px-4 py-4 font-semibold">Status</th>
                    <th className="px-4 py-4 font-semibold">Featured</th>
                    <th className="px-4 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4 min-w-[260px]">
                          <img
                            src={post.image}
                            alt=""
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_IMAGE;
                            }}
                            className="h-14 w-20 rounded-xl object-cover bg-gray-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate max-w-xs">
                              {post.title}
                            </p>
                            <p className="text-xs text-gray-400 truncate max-w-xs">
                              {post.author} · {post.readTime} min read
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs font-semibold">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          disabled={busyId === post.id}
                          onClick={() => quickUpdate(post, { published: !post.published })}
                          title={post.published ? 'Click to unpublish' : 'Click to publish'}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                            post.published
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {post.published ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          disabled={busyId === post.id || post.featured}
                          onClick={() => quickUpdate(post, { featured: true })}
                          title={post.featured ? 'Currently featured' : 'Make featured'}
                          className={`text-xl leading-none transition-colors disabled:cursor-default ${
                            post.featured ? 'text-amber-400' : 'text-gray-300 hover:text-amber-400'
                          }`}
                        >
                          {post.featured ? '★' : '☆'}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                        {formatDate(post.publishedAt || post.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(post)}
                            className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:border-gray-400 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDelete(post)}
                            className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit modal */}
      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-10"
          onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {modal.editingId ? 'Edit Post' : 'New Post'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {modal.loadingPost ? (
              <div className="py-16 text-center text-gray-400 text-sm">Loading post...</div>
            ) : (
              <form onSubmit={handleSave} className="space-y-5">
                {formError && (
                  <div
                    aria-live="polite"
                    className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl"
                  >
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                  <input
                    value={form.title}
                    onChange={setField('title')}
                    maxLength={200}
                    placeholder="Top 10 Football Boots of 2026"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Excerpt
                    <span className="float-right text-xs text-gray-400">
                      {form.excerpt.length}/400
                    </span>
                  </label>
                  <textarea
                    value={form.excerpt}
                    onChange={setField('excerpt')}
                    maxLength={400}
                    rows={2}
                    placeholder="A short summary shown on the blog page"
                    className={inputClass}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Category
                    </label>
                    <input
                      value={form.category}
                      onChange={setField('category')}
                      list="blog-categories"
                      placeholder="Footwear"
                      className={inputClass}
                    />
                    <datalist id="blog-categories">
                      {categories.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Author <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      value={form.author}
                      onChange={setField('author')}
                      placeholder="City Sports"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Image URL
                  </label>
                  <input
                    value={form.image}
                    onChange={setField('image')}
                    placeholder="https://..."
                    className={inputClass}
                  />
                  {form.image.trim() && (
                    <img
                      src={form.image}
                      alt="Preview"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={(e) => {
                        e.currentTarget.style.display = 'block';
                      }}
                      className="mt-3 h-36 w-full rounded-2xl object-cover bg-gray-100"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Content</label>
                  <textarea
                    value={form.content}
                    onChange={setField('content')}
                    rows={10}
                    placeholder="Write the full article here. Separate paragraphs with a blank line."
                    className={`${inputClass} font-mono leading-relaxed`}
                  />
                </div>

                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={setField('published')}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    Published
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={setField('featured')}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    Featured (replaces the current featured post)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-2xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:border-gray-400 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 px-8 py-3 text-sm font-semibold text-white transition-all"
                  >
                    {saving ? 'Saving...' : modal.editingId ? 'Save Changes' : 'Create Post'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onMouseDown={(e) => e.target === e.currentTarget && !deleting && setConfirmDelete(null)}
        >
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
            <h3 className="text-xl font-bold text-gray-900">Delete this post?</h3>
            <p className="mt-3 text-sm text-gray-500">
              “{confirmDelete.title}” will be permanently removed. This can't be undone.
            </p>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="rounded-2xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:border-gray-400 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-2xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 px-6 py-3 text-sm font-semibold text-white transition-all"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-[60] rounded-2xl px-5 py-3 text-sm font-medium shadow-lg text-white ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-gray-900'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default BlogManager;