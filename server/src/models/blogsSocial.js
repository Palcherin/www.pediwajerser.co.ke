const { DataTypes } = require('sequelize');
const db = require('../config/database');
const sequelize = db.sequelize || db;

const BlogLike = sequelize.define(
  'BlogLike',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    blogId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: 'blog_likes',
    underscored: true,
    timestamps: true,
    updatedAt: false,
    indexes: [{ unique: true, fields: ['blog_id', 'user_id'] }],
  }
);

const BlogComment = sequelize.define(
  'BlogComment',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    blogId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    tableName: 'blog_comments',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = { BlogLike, BlogComment };