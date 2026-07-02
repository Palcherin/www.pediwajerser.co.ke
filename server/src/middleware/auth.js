/**
 * Authentication Middleware
 * 
 * Handles JWT authentication and authorization for protected routes.
 * 
 * @module middleware/auth
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ApiError } = require('./errorHandler');

/**
 * Authentication Middleware
 * 
 * Verifies JWT token and attaches user to request object.
 * 
 * @async
 * @function authenticate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {ApiError} If authentication fails
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, 'No token provided', 'NO_TOKEN');
        }
        
        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password_hash'] }
        });
        
        if (!user) {
            throw new ApiError(401, 'User not found', 'USER_NOT_FOUND');
        }
        
        // Check if user is active
        if (!user.is_active) {
            throw new ApiError(401, 'Account is deactivated', 'ACCOUNT_INACTIVE');
        }
        
        // Attach user to request
        req.user = user;
        req.userId = user.id;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new ApiError(401, 'Invalid token', 'INVALID_TOKEN'));
        } else if (error instanceof jwt.TokenExpiredError) {
            next(new ApiError(401, 'Token expired', 'TOKEN_EXPIRED'));
        } else {
            next(error);
        }
    }
};

/**
 * Admin Authorization Middleware
 * 
 * Checks if authenticated user has admin role.
 * 
 * @async
 * @function authorizeAdmin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {ApiError} If user is not an admin
 */
const authorizeAdmin = async (req, res, next) => {
    if (!req.user) {
        return next(new ApiError(401, 'Authentication required', 'NOT_AUTHENTICATED'));
    }
    
    if (req.user.role !== 'admin') {
        return next(new ApiError(403, 'Admin access required', 'FORBIDDEN'));
    }
    
    next();
};

/**
 * Optional Authentication Middleware
 * 
 * Attempts to authenticate but continues even if no token is provided.
 * 
 * @async
 * @function optionalAuthenticate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const optionalAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.id);
            if (user && user.is_active) {
                req.user = user;
                req.userId = user.id;
            }
        }
    } catch (error) {
        // Ignore authentication errors for optional auth
        // Just proceed without user
    }
    next();
};

module.exports = {
    authenticate,
    authorizeAdmin,
    optionalAuthenticate
};