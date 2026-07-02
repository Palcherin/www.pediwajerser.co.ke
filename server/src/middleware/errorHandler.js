/**
 * Error Handling Middleware
 * 
 * Centralized error handling for the application.
 * 
 * @module middleware/errorHandler
 */

const { errorLogger } = require('./logger');

/**
 * Custom error class for API errors
 * 
 * @class ApiError
 * @extends Error
 */
class ApiError extends Error {
    /**
     * Creates an ApiError instance
     * 
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Error message
     * @param {string} code - Error code
     * @param {Object} details - Additional error details
     */
    constructor(statusCode, message, code = 'INTERNAL_ERROR', details = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Not Found Handler
 * 
 * Handles 404 errors for undefined routes.
 * 
 * @function notFoundHandler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const notFoundHandler = (req, res, next) => {
    const error = new ApiError(
        404,
        `Route ${req.originalUrl} not found`,
        'ROUTE_NOT_FOUND'
    );
    next(error);
};

/**
 * Main Error Handler
 * 
 * Handles all errors and sends appropriate responses.
 * 
 * @function errorHandler
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
    // Log error
    errorLogger(err, req, res, next);
    
    // Default error
    let error = { ...err };
    error.message = err.message;
    
    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
        const message = err.errors.map(e => e.message).join(', ');
        error = new ApiError(400, message, 'VALIDATION_ERROR');
    }
    
    // Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
        const message = err.errors.map(e => e.message).join(', ');
        error = new ApiError(409, message, 'DUPLICATE_ERROR');
    }
    
    // Sequelize foreign key constraint error
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        error = new ApiError(409, 'Related record not found', 'FOREIGN_KEY_ERROR');
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new ApiError(401, 'Invalid token', 'INVALID_TOKEN');
    }
    
    if (err.name === 'TokenExpiredError') {
        error = new ApiError(401, 'Token expired', 'TOKEN_EXPIRED');
    }
    
    // Send response
    const response = {
        success: false,
        error: {
            message: error.message || 'Internal server error',
            code: error.code || 'INTERNAL_ERROR',
            ...(error.details && { details: error.details }),
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    };
    
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json(response);
};

module.exports = {
    ApiError,
    notFoundHandler,
    errorHandler
};