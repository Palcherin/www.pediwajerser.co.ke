/**
 * Models Index
 * 
 * This file exports all models and sets up associations.
 * 
 * @module models
 */

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Import models
const User = require('./User')(sequelize, DataTypes);
const Product = require('./Product')(sequelize, DataTypes);
const Cart = require('./Cart')(sequelize, DataTypes);
const Order = require('./Order')(sequelize, DataTypes);
const OrderItem = require('./OrderItem')(sequelize, DataTypes);
const Review = require('./Review')(sequelize, DataTypes);

// Define associations
const defineAssociations = () => {
    // User associations
    User.hasMany(Cart, { foreignKey: 'user_id', as: 'cartItems' });
    User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
    User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
    
    // Product associations
    Product.hasMany(Cart, { foreignKey: 'product_id', as: 'cartItems' });
    Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
    Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });
    
    // Cart associations
    Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    Cart.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
    
    // Order associations
    Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
    
    // OrderItem associations
    OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
    OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
    
    // Review associations
    Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
};

// Call associations
defineAssociations();

module.exports = {
    sequelize,
    User,
    Product,
    Cart,
    Order,
    OrderItem,
    Review
};