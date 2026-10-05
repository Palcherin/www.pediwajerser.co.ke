const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../config/database');
const { User } = require('../models');
const Blog = require('../models/Blogs');
const { BlogLike, BlogComment } = require('../models/blogsSocial');

const ALLOWED_FIELDS = ['title', 'excerpt', 'content', 'image', 'category', 'author', 'featured', 'published'];

const isNumericId = (value) => /^\d+$/.test(String(value));
const escapeLike = (str) => str.replace(/[\\%_]/g, '\\$&');

const pickFields = (body) =>
  ALLOWED_FIELDS.reduce((acc, key) => {
    if (body[key] !== undefined) acc[key] = body[key];
    return acc;
  }, {});

const handleError = (res, err, fallback = 'Server error') => {
  console.error(err);
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ success: false, message: err.errors.map((e) => e.message).join(', ') });
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ success: false, message: 'A post with this slug already exists' });
  }
  return res.status(500).json({ success: false, message: fallback });
};

// Like / comment counts as subqueries
const COUNT_ATTRS = [
  [literal('(SELECT COUNT(*) FROM blog_likes WHERE blog_likes.blog_id = "Blog"."id")::int'), 'likeCount'],
  [literal('(SELECT COUNT(*) FROM blog_comments WHERE blog_comments.blog_id = "Blog"."id")::int'), 'commentCount'],
];

// "John K." (never expose emails)
const displayName = (u) => {
  if (!u) return 'Customer';
  const first = u.first_name || '';
  const last = u.last_name ? `${u.last_name[0]}.` : '';
  return `${first} ${last}`.trim() || 'Customer';
};

const publishedBlogExists = async (id) =>
  !!(await Blog.findOne({ where: { id, published: true }, attributes: ['id'] }));

// ---------- Public ----------
exports.getBlogs = async (req, res) => {
  try {
    const { category, search, limit } = req.query;
    const where = { published: true };
    if (category && category !== 'All') where.category = category;
    if (search) {
      const pattern = `%${escapeLike(search)}%`;
      where[Op.or] = [{ title: { [Op.iLike]: pattern } }, { excerpt: { [Op.iLike]: pattern } }];
    }
    const blogs = await Blog.findAll({
      where,
      attributes: { exclude: ['content'], include: COUNT_ATTRS },
      order: [['featured', 'DESC'], ['publishedAt', 'DESC NULLS LAST']],
      limit: Number(limit) > 0 ? Number(limit) : undefined,
    });
    res.json({ success: true, count: blogs.length, data: blogs });
  } catch (err) {
    handleError(res, err, 'Failed to fetch blogs');
  }
};

exports.getCategories = async (req, res) => {
  try {
    const rows = await Blog.findAll({
      attributes: [[fn('DISTINCT', col('category')), 'category']],
      where: { published: true },
      order: [['category', 'ASC']],
      raw: true,
    });
    res.json({ success: true, data: rows.map((r) => r.category) });
  } catch (err) {
    handleError(res, err, 'Failed to fetch categories');
  }
};

// Uses optionalAuthenticate, so `liked` is accurate for logged-in users
exports.getBlog = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const match = isNumericId(idOrSlug)
      ? { [Op.or]: [{ id: Number(idOrSlug) }, { slug: idOrSlug }] }
      : { slug: idOrSlug };
    const blog = await Blog.findOne({
      where: { published: true, ...match },
      attributes: { include: COUNT_ATTRS },
    });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    const liked = req.userId
      ? !!(await BlogLike.findOne({ where: { blogId: blog.id, userId: req.userId }, attributes: ['id'] }))
      : false;

    res.json({ success: true, data: { ...blog.toJSON(), liked } });
  } catch (err) {
    handleError(res, err, 'Failed to fetch blog');
  }
};

// ---------- Likes ----------
exports.toggleLike = async (req, res) => {
  try {
    if (!isNumericId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog id' });
    }
    const blogId = Number(req.params.id);
    if (!(await publishedBlogExists(blogId))) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const where = { blogId, userId: req.userId };
    const existing = await BlogLike.findOne({ where });
    let liked;
    if (existing) {
      await existing.destroy();
      liked = false;
    } else {
      try {
        await BlogLike.create(where);
      } catch (e) {
        // double-click race: the unique index already stored the like
        if (e.name !== 'SequelizeUniqueConstraintError') throw e;
      }
      liked = true;
    }

    const likeCount = await BlogLike.count({ where: { blogId } });
    res.json({ success: true, liked, likeCount });
  } catch (err) {
    handleError(res, err, 'Failed to update like');
  }
};

// ---------- Comments ----------
exports.getComments = async (req, res) => {
  try {
    if (!isNumericId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog id' });
    }
    const blogId = Number(req.params.id);
    if (!(await publishedBlogExists(blogId))) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const { count, rows } = await BlogComment.findAndCountAll({
      where: { blogId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const users = await User.findAll({
      where: { id: [...new Set(rows.map((r) => r.userId))] },
      attributes: ['id', 'first_name', 'last_name'],
    });
    const byId = new Map(users.map((u) => [u.id, u]));
    const isAdmin = req.user?.role === 'admin';

    res.json({
      success: true,
      total: count,
      data: rows.map((r) => ({
        id: r.id,
        content: r.content,
        createdAt: r.createdAt,
        author: displayName(byId.get(r.userId)),
        canDelete: isAdmin || (!!req.userId && req.userId === r.userId),
      })),
    });
  } catch (err) {
    handleError(res, err, 'Failed to fetch comments');
  }
};

exports.addComment = async (req, res) => {
  try {
    if (!isNumericId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog id' });
    }
    const blogId = Number(req.params.id);
    if (!(await publishedBlogExists(blogId))) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const content = String(req.body.content || '').trim();
    if (!content) return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
    if (content.length > 1000) {
      return res.status(400).json({ success: false, message: 'Comment is too long (max 1000 characters)' });
    }

    const comment = await BlogComment.create({ blogId, userId: req.userId, content });
    res.status(201).json({
      success: true,
      data: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: displayName(req.user),
        canDelete: true,
      },
    });
  } catch (err) {
    handleError(res, err, 'Failed to add comment');
  }
};

exports.deleteComment = async (req, res) => {
  try {
    if (!isNumericId(req.params.commentId)) {
      return res.status(400).json({ success: false, message: 'Invalid comment id' });
    }
    const comment = await BlogComment.findByPk(Number(req.params.commentId));
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.userId !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    await comment.destroy();
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    handleError(res, err, 'Failed to delete comment');
  }
};

// ---------- Admin ----------
exports.getAllBlogsAdmin = async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      attributes: { exclude: ['content'] },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, count: blogs.length, data: blogs });
  } catch (err) {
    handleError(res, err, 'Failed to fetch blogs');
  }
};

exports.getBlogAdmin = async (req, res) => {
  try {
    if (!isNumericId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog id' });
    }
    const blog = await Blog.findByPk(Number(req.params.id));
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, data: blog });
  } catch (err) {
    handleError(res, err, 'Failed to fetch blog');
  }
};

exports.createBlog = async (req, res) => {
  try {
    const data = pickFields(req.body);
    if (!data.author && req.user?.first_name) data.author = req.user.first_name;

    const blog = await sequelize.transaction(async (t) => {
      const created = await Blog.create(data, { transaction: t });
      if (created.featured) {
        await Blog.update(
          { featured: false },
          { where: { featured: true, id: { [Op.ne]: created.id } }, transaction: t }
        );
      }
      return created;
    });

    res.status(201).json({ success: true, message: 'Blog created', data: blog });
  } catch (err) {
    handleError(res, err, 'Failed to create blog');
  }
};

exports.updateBlog = async (req, res) => {
  try {
    if (!isNumericId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog id' });
    }

    const blog = await sequelize.transaction(async (t) => {
      const existing = await Blog.findByPk(Number(req.params.id), { transaction: t });
      if (!existing) return null;

      existing.set(pickFields(req.body));
      await existing.save({ transaction: t });

      if (existing.featured) {
        await Blog.update(
          { featured: false },
          { where: { featured: true, id: { [Op.ne]: existing.id } }, transaction: t }
        );
      }
      return existing;
    });

    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, message: 'Blog updated', data: blog });
  } catch (err) {
    handleError(res, err, 'Failed to update blog');
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    if (!isNumericId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog id' });
    }
    const id = Number(req.params.id);

    const deleted = await sequelize.transaction(async (t) => {
      await BlogLike.destroy({ where: { blogId: id }, transaction: t });
      await BlogComment.destroy({ where: { blogId: id }, transaction: t });
      return Blog.destroy({ where: { id }, transaction: t });
    });

    if (!deleted) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, message: 'Blog deleted' });
  } catch (err) {
    handleError(res, err, 'Failed to delete blog');
  }
};