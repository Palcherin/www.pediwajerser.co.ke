/**
 * Jersey Store Backend Server
 * 
 * Main entry point for the e-commerce backend application.
 * Configures Express server with middleware, routes, and database connection.
 * 
 * @module server
 */

require('dotenv').config();
const app = require('./src/app');
const { sequelize, testConnection } = require('./src/config/database');

// Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Initializes and starts the server
 * 
 * This function:
 * 1. Tests database connection
 * 2. Syncs database models
 * 3. Starts the Express server
 * 4. Sets up graceful shutdown
 * 
 * @async
 * @function initializeServer
 */
const initializeServer = async () => {
    try {
        console.log('🚀 Starting Jersey Store Backend...');
        console.log(`📦 Environment: ${NODE_ENV}`);
        
        // 1. Test database connection
        console.log('📊 Testing database connection...');
        await testConnection();
        
        // 2. Sync database models (in development, use alter: true for migrations)
        if (NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('📊 Database models synchronized');
        }
        
        // 3. Start the server
        const server = app.listen(PORT, () => {
            console.log(`✅ Server is running!`);
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
            console.log('🚀 Server ready for requests!');
        });
        
        // 4. Graceful shutdown handler
        const gracefulShutdown = async (signal) => {
            console.log(`\n⚠️ Received ${signal}. Starting graceful shutdown...`);
            
            server.close(async () => {
                console.log('🔒 HTTP server closed.');
                
                try {
                    await sequelize.close();
                    console.log('📊 Database connection closed.');
                    console.log('✅ Graceful shutdown complete.');
                    process.exit(0);
                } catch (error) {
                    console.error('❌ Error during shutdown:', error);
                    process.exit(1);
                }
            });
            
            // Force shutdown after timeout
            setTimeout(() => {
                console.error('⚠️ Force shutdown after timeout.');
                process.exit(1);
            }, 10000);
        };
        
        // Register signal handlers
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught Exception:', error);
            gracefulShutdown('uncaughtException');
        });
        
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Unhandled Rejection at:', promise);
            console.error('📝 Reason:', reason);
            gracefulShutdown('unhandledRejection');
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
initializeServer();

// Export for testing
module.exports = { initializeServer };