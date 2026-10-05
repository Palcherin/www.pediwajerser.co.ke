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
 * Strict authentication: a valid token is required.
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, 'No token provided', 'NO_TOKEN');
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password_hash'] }
        });

        if (!user) {
            throw new ApiError(401, 'User not found', 'USER_NOT_FOUND');
        }
        if (!user.is_active) {
            throw new ApiError(401, 'Account is deactivated', 'ACCOUNT_INACTIVE');
        }

        req.user = user;
        req.userId = user.id;
        next();
    } catch (error) {
        // TokenExpiredError extends JsonWebTokenError, so check it first
        if (error instanceof jwt.TokenExpiredError) {
            next(new ApiError(401, 'Token expired', 'TOKEN_EXPIRED'));
        } else if (error instanceof jwt.JsonWebTokenError) {
            next(new ApiError(401, 'Invalid token', 'INVALID_TOKEN'));
        } else {
            next(error);
        }
    }
};

/**
 * Optional authentication: attaches the user if a valid token is sent,
 * otherwise continues as a guest. Never blocks the request.
 */
const optionalAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // guest
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password_hash'] }
        });

        if (user && user.is_active) {
            req.user = user;
            req.userId = user.id;
        }
    } catch (error) {
        // Invalid or expired token: ignore and continue as guest
    }
    next();
};

/**
 * Admin authorization: requires authenticate to have run first.
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

module.exports = {
    authenticate,
    optionalAuthenticate,
    authorizeAdmin
};