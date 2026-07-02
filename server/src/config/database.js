/**
 * Database Configuration Module
 * 
 * This module handles the Sequelize connection to PostgreSQL database.
 * It uses environment variables for configuration and provides a centralized
 * database connection pool management.
 * 
 * @module config/database
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Sequelize instance configuration
 * 
 * Creates a new Sequelize instance with connection parameters from environment variables.
 * Includes connection pool settings for production optimization.
 */
const sequelize = new Sequelize(
    process.env.DB_NAME,      // Database name
    process.env.DB_USER,      // Database username
    process.env.DB_PASSWORD,  // Database password
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: process.env.DB_DIALECT || 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,              // Maximum number of connection in pool
            min: 0,               // Minimum number of connection in pool
            acquire: 30000,       // Maximum time (ms) to get connection
            idle: 10000           // Maximum time (ms) connection can be idle
        },
        define: {
            timestamps: true,     // Adds createdAt and updatedAt automatically
            underscored: true,    // Converts camelCase to snake_case in DB
            underscoredAll: true,
            paranoid: true        // Adds deletedAt for soft deletes
        }
    }
);

/**
 * Tests the database connection
 * 
 * @async
 * @function testConnection
 * @throws {Error} If connection fails
 */
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
};

/**
 * Synchronizes all models with the database
 * 
 * @async
 * @function syncDatabase
 * @param {Object} options - Sync options
 * @param {boolean} options.force - Drop and recreate tables (default: false)
 * @param {boolean} options.alter - Alter tables to match models (default: false)
 */
const syncDatabase = async (options = { force: false, alter: false }) => {
    try {
        await sequelize.sync(options);
        console.log('✅ Database synchronized successfully.');
    } catch (error) {
        console.error('❌ Error synchronizing database:', error);
        throw error;
    }
};

module.exports = {
    sequelize,
    testConnection,
    syncDatabase
};