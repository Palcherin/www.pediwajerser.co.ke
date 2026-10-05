import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // ADJUST path

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const FALLBACK_IMAGE = 'https://placehold.co/1200x800?text=City+Sports';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

const BlogPostPage = () => {
 const params = useParams();
const idOrSlug = params.idOrSlug ?? params.id ?? params.slug;
  const auth = useAuth();
  const token = auth?.token || localStorage.getItem('token'); // same as BlogManager
  const isLoggedIn = !!token;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [liking, setLiking] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentTotal, setCommentTotal] = useState(0);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [copied, setCopied] = useState(false);

  const api = useCallback(
    async (path, options = {}) => {
      const res = await fetch(`${API_URL}/api/blogs${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        throw new Error(json.message || `Request failed (${res.status})`);
      }
      return json;
    },
    [token]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const json = await api(`/${encodeURIComponent(idOrSlug)}`);
        if (cancelled) return;
        setPost(json.data);
        const c = await api(`/${json.data.id}/comments`);
        if (!cancelled) {
          setComments(c.data);
          setCommentTotal(c.total);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, idOrSlug]);

  const toggleLike = async () => {
    if (!isLoggedIn) return setNotice('Please sign in to like this post.');
    if (liking) return;
    setLiking(true);
    setNotice('');
    try {
      const json = await api(`/${post.id}/like`, { method: 'POST' });
      setPost((p) => ({ ...p, liked: json.liked, likeCount: json.likeCount }));
    } catch (err) {
      setNotice(err.message);
    } finally {
      setLiking(false);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    setPosting(true);
    setCommentError('');
    try {
      const json = await api(`/${post.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      setComments((prev) => [json.data, ...prev]);
      setCommentTotal((n) => n + 1);
      setDraft('');
    } catch (err) {
      setCommentError(err.message);
    } finally {
      setPosting(false);
    }
  };

  const removeComment = async (id) => {
    try {
      await api(`/comments/${id}`, { method: 'DELETE' });
      setComments((prev) => prev.filter((c) => c.id !== id));
      setCommentTotal((n) => Math.max(0, n - 1));
    } catch (err) {
      setCommentError(err.message);
    }
  };

  // ---- Share ----
  const url = window.location.href;
  const shareText = post ? `${post.title} | City Sports` : '';
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const nativeShare = async () => {
    try {
      await navigator.share({ title: post.title, text: post.excerpt, url });
    } catch {
      /* user cancelled */
    }
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setNotice('Could not copy the link. Copy it from the address bar.');
    }
  };

  const shareLinks = [
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}` },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
    },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  ];

  const pill =
    'rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400 transition-colors';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-4">
          <div className="h-8 w-3/4 rounded bg-gray-200" />
          <div className="h-72 rounded-3xl bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-100" />
          <div className="h-4 w-2/3 rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-24 text-center px-4">
        <h3 className="text-3xl font-bold text-gray-300">Post not found</h3>
        <p className="mt-3 text-gray-400">{error}</p>
        <Link to="/blog" className="inline-block mt-6 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white">
          Back to blog
        </Link>
      </div>
    );
  }

  const paragraphs = (post.content || '').split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-3xl mx-auto px-4 py-10">
        <Link to="/blog" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
          ← Back to blog
        </Link>

        <p className="mt-6 text-xs font-bold tracking-[0.2em] uppercase text-emerald-600">{post.category}</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-tight">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-400">
          <span>{post.author}</span>
          <span>•</span>
          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
          <span>•</span>
          <span>{post.readTime} min read</span>
        </div>

        <img
          src={post.image}
          alt={post.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="mt-8 w-full max-h-[460px] rounded-3xl object-cover bg-gray-100"
        />

        <div className="mt-8 space-y-5 text-lg leading-relaxed text-gray-700">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">{p}</p>
          ))}
        </div>

        {/* Like + share */}
        <div className="mt-10 flex flex-wrap items-center gap-3 border-y border-gray-100 py-5">
          <button
            onClick={toggleLike}
            disabled={liking}
            aria-pressed={!!post.liked}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
              post.liked
                ? 'bg-red-50 border border-red-200 text-red-600'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400'
            }`}
          >
            {post.liked ? '♥' : '♡'} {post.likeCount || 0}
          </button>
          <span className="text-sm text-gray-400">{commentTotal} comments</span>

          <div className="ml-auto flex flex-wrap gap-2">
            {canNativeShare && (
              <button onClick={nativeShare} className={pill}>Share</button>
            )}
            {shareLinks.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={pill}>
                {s.label}
              </a>
            ))}
            <button onClick={copyLink} className={pill}>{copied ? 'Copied!' : 'Copy link'}</button>
          </div>
        </div>
        {notice && <p className="mt-3 text-sm text-red-600">{notice}</p>}

        {/* Comments */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">Comments ({commentTotal})</h2>

          {isLoggedIn ? (
            <form onSubmit={submitComment} className="mt-5">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Share your thoughts..."
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-400">{draft.length}/1000</span>
                <button
                  type="submit"
                  disabled={posting || !draft.trim()}
                  className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 px-6 py-2.5 text-sm font-semibold text-white transition-colors"
                >
                  {posting ? 'Posting...' : 'Post comment'}
                </button>
              </div>
              {commentError && <p className="mt-2 text-sm text-red-600">{commentError}</p>}
            </form>
          ) : (
            <p className="mt-5 rounded-2xl bg-white border border-gray-100 px-5 py-4 text-sm text-gray-600">
              <Link to="/login" className="font-semibold text-emerald-600 hover:underline">Sign in</Link>{' '}
              to like and comment on this post.
            </p>
          )}

          <ul className="mt-6 space-y-4">
            {comments.map((c) => (
              <li key={c.id} className="rounded-2xl bg-white border border-gray-100 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {c.author}
                    <span className="ml-2 font-normal text-gray-400">{formatDate(c.createdAt)}</span>
                  </p>
                  {c.canDelete && (
                    <button
                      onClick={() => removeComment(c.id)}
                      className="text-xs font-semibold text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-line break-words">{c.content}</p>
              </li>
            ))}
            {comments.length === 0 && <li className="text-sm text-gray-400">No comments yet. Be the first.</li>}
          </ul>
        </section>
      </article>
    </div>
  );
};

export default BlogPostPage;