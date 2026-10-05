const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const {
  getBlogs, getCategories, getBlog,
  toggleLike, getComments, addComment, deleteComment,
  getAllBlogsAdmin, getBlogAdmin, createBlog, updateBlog, deleteBlog,
} = require('../controllers/blogControllers');

const { authenticate, optionalAuthenticate, authorizeAdmin } = require('../middleware/auth');

const commentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many comments. Please try again in a few minutes.' },
});

const likeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Slow down a little.' },
});

// Public
router.get('/', getBlogs);
router.get('/categories', getCategories);

// Admin (before '/:idOrSlug')
router.get('/admin/all', authenticate, authorizeAdmin, getAllBlogsAdmin);
router.get('/admin/:id', authenticate, authorizeAdmin, getBlogAdmin);

// Social: logged-in users (delete is owner or admin, checked in the controller)
router.delete('/comments/:commentId', authenticate, deleteComment);
router.get('/:id/comments', optionalAuthenticate, getComments);
router.post('/:id/comments', authenticate, commentLimiter, addComment);
router.post('/:id/like', authenticate, likeLimiter, toggleLike);

// Single post (optional auth so `liked` is correct)
router.get('/:idOrSlug', optionalAuthenticate, getBlog);

// Admin write
router.post('/', authenticate, authorizeAdmin, createBlog);
router.put('/:id', authenticate, authorizeAdmin, updateBlog);
router.delete('/:id', authenticate, authorizeAdmin, deleteBlog);

module.exports = router;