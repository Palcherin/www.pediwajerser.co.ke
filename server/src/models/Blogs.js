const { DataTypes } = require('sequelize');

// ADJUST THIS to wherever you export your Sequelize instance
// (the one created with new Sequelize(process.env.DATABASE_URL, ...)).
const db = require('../config/database');
const sequelize = db.sequelize || db; // works for both `module.exports = sequelize` and `{ sequelize }`

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const Blog = sequelize.define(
  'Blog',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { notEmpty: { msg: 'Title is required' } },
    },
    slug: {
      type: DataTypes.STRING(255),
      unique: true,
    },
    excerpt: {
      type: DataTypes.STRING(400),
      allowNull: false,
      validate: { notEmpty: { msg: 'Excerpt is required' } },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: { msg: 'Content is required' } },
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: { msg: 'Image URL is required' } },
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: { msg: 'Category is required' } },
    },
    author: {
      type: DataTypes.STRING(120),
      allowNull: false,
      defaultValue: 'City Sports',
    },
    readTime: {
      type: DataTypes.INTEGER, // minutes, calculated automatically from content
      allowNull: false,
      defaultValue: 1,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    publishedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: 'blogs',
    timestamps: true, // createdAt / updatedAt
    underscored: true, // columns become read_time, published_at, created_at, ...
    indexes: [
      { fields: ['category'] },
      { fields: ['published', 'featured', 'published_at'] },
    ],
    hooks: {
      beforeValidate: async (blog) => {
        // Unique slug (generated once, so existing links never break)
        if (!blog.slug && blog.title) {
          const base = slugify(blog.title) || 'post';
          let candidate = base;
          let counter = 1;
          // eslint-disable-next-line no-await-in-loop
          while (await Blog.findOne({ where: { slug: candidate }, attributes: ['id'] })) {
            counter += 1;
            candidate = `${base}-${counter}`;
          }
          blog.slug = candidate;
        }

        // Read time at ~200 words per minute
        if (blog.changed('content') && blog.content) {
          const words = blog.content.trim().split(/\s+/).length;
          blog.readTime = Math.max(1, Math.ceil(words / 200));
        }

        // Stamp the publish date the first time a post goes live
        if (blog.published && !blog.publishedAt) {
          blog.publishedAt = new Date();
        }
      },
    },
  }
);

module.exports = Blog;