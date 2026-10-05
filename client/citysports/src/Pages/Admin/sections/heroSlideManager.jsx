import React, { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const imgUrl = (p) => (p && p.startsWith('/uploads') ? `${API}${p}` : p);
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const EMPTY = {
  tag: '', title: '', subtitle: '', cta: 'Shop Now', link: '/',
  accent: '#4ade80', bg_color: '#111111', sort_order: 0, is_active: true,
};

const input = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500';

const HeroSlidesAdmin = () => {
  const [slides, setSlides] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const res = await fetch(`${API}/api/hero-slides/all`, { headers: authHeader() });
    const data = await res.json();
    if (data.success) setSlides(data.slides);
  };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const reset = () => { setForm(EMPTY); setEditingId(null); setFile(null); setError(''); };

  const startEdit = (s) => {
    setEditingId(s.id);
    setFile(null);
    setForm({
      tag: s.tag || '', title: s.title, subtitle: s.subtitle || '', cta: s.cta || '',
      link: s.link || '/', accent: s.accent, bg_color: s.bg_color,
      sort_order: s.sort_order, is_active: s.is_active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    if (!editingId && !file) return setError('Please choose an image');
    if (!form.title.trim()) return setError('Title is required');

    const body = new FormData();                      // no Content-Type header: the browser sets it
    Object.entries(form).forEach(([k, v]) => body.append(k, v));
    if (file) body.append('image', file);

    setBusy(true);
    try {
      const res = await fetch(`${API}/api/hero-slides${editingId ? `/${editingId}` : ''}`, {
        method: editingId ? 'PUT' : 'POST',
        headers: authHeader(),
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Save failed');
      reset();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (s) => {
    const body = new FormData();
    body.append('is_active', !s.is_active);
    await fetch(`${API}/api/hero-slides/${s.id}`, { method: 'PUT', headers: authHeader(), body });
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this slide?')) return;
    await fetch(`${API}/api/hero-slides/${id}`, { method: 'DELETE', headers: authHeader() });
    if (editingId === id) reset();
    load();
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Homepage Carousel</h1>

      {/* Form */}
      <form onSubmit={save} className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4">
        <h2 className="font-bold text-gray-900">{editingId ? 'Edit slide' : 'Add slide'}</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <input className={input} placeholder="Tag (e.g. New Arrival)" value={form.tag} onChange={e => set('tag', e.target.value)} />
          <input className={input} placeholder="Title (use Enter-free text; line breaks: \n)" value={form.title} onChange={e => set('title', e.target.value)} />
          <input className={input} placeholder="Subtitle" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} />
          <input className={input} placeholder="Button text" value={form.cta} onChange={e => set('cta', e.target.value)} />
          <input className={input} placeholder="Button link (e.g. /category/retro-kits)" value={form.link} onChange={e => set('link', e.target.value)} />
          <input className={input} type="number" placeholder="Order" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} />
          <label className="flex items-center gap-3 text-sm text-gray-600">
            Accent colour
            <input type="color" value={form.accent} onChange={e => set('accent', e.target.value)} />
          </label>
          <label className="flex items-center gap-3 text-sm text-gray-600">
            Background colour
            <input type="color" value={form.bg_color} onChange={e => set('bg_color', e.target.value)} />
          </label>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Image {editingId && '(leave empty to keep current)'} — landscape, about 1920×1080, JPG/PNG/WebP, max 5 MB
          </label>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setFile(e.target.files[0] || null)} />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />
          Show on homepage
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button disabled={busy} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold px-6 py-2.5 rounded-xl">
            {busy ? 'Saving...' : editingId ? 'Update slide' : 'Add slide'}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="text-gray-500 hover:text-gray-700 px-4">Cancel</button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="space-y-3">
        {slides.map(s => (
          <div key={s.id} className={`bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 items-center ${!s.is_active ? 'opacity-50' : ''}`}>
            <img src={imgUrl(s.image)} alt="" className="w-28 h-16 object-cover rounded-xl bg-gray-100 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{s.title.replace(/\\n|\n/g, ' ')}</p>
              <p className="text-xs text-gray-400 truncate">Order {s.sort_order} · {s.link}</p>
            </div>
            <button onClick={() => toggleActive(s)} className="text-sm text-gray-500 hover:text-gray-800">
              {s.is_active ? 'Hide' : 'Show'}
            </button>
            <button onClick={() => startEdit(s)} className="text-sm text-emerald-600 hover:text-emerald-800">Edit</button>
            <button onClick={() => remove(s.id)} className="text-sm text-red-400 hover:text-red-600">Delete</button>
          </div>
        ))}
        {!slides.length && (
          <p className="text-sm text-gray-400">No slides yet. The homepage is showing the built-in default slides.</p>
        )}
      </div>
    </div>
  );
};

export default HeroSlidesAdmin;