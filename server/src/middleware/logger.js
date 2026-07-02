/**
 * Logging Middleware
 * 
 * Provides request logging functionality for debugging and monitoring.
 * 
 * @module middleware/logger
 */

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Request Logger Middleware
 * 
 * Logs incoming requests with timestamp, method, URL, and response time.
 * 
 * @function requestLogger
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log when response is finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        const log = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent')
        };
        
        // Console log in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[${log.timestamp}] ${log.method} ${log.url} - ${log.status} (${log.duration})`);
        }
        
        // File log for all environments
        const logLine = JSON.stringify(log) + '\n';
        fs.appendFileSync(
            path.join(logsDir, `access-${new Date().toISOString().split('T')[0]}.log`),
            logLine
        );
    });
    
    next();
};

/**
 * Error Logger Middleware
 * 
 * Logs error details for debugging purposes.
 * 
 * @function errorLogger
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorLogger = (error, req, res, next) => {
    const log = {
        timestamp: new Date().toISOString(),
        error: {
            message: error.message,
            stack: error.stack,
            name: error.name
        },
        request: {
            method: req.method,
            url: req.originalUrl,
            body: req.body,
            query: req.query,
            params: req.params,
            ip: req.ip
        }
    };
    
    // Console error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error:', JSON.stringify(log, null, 2));
    }
    
    // File log
    fs.appendFileSync(
        path.join(logsDir, `error-${new Date().toISOString().split('T')[0]}.log`),
        JSON.stringify(log) + '\n'
    );
    
    next(error);
};

module.exports = { requestLogger, errorLogger };