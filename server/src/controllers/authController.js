/**
 * Authentication Controller
 * 
 * Handles user registration, login, and profile management
 * 
 * @module controllers/authController
 */

const { User } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

/**
 * Generate JWT token
 * 
 * @function generateToken
 * @param {number} userId - User ID
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

/**
 * Register a new user
 * 
 * @async
 * @function register
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const register = async (req, res, next) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validation error', 'VALIDATION_ERROR', errors.array());
        }
        
        const { 
            email, 
            password, 
            first_name, 
            last_name, 
            phone, 
            address, 
            city, 
            state, 
            zip_code, 
            country 
        } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new ApiError(409, 'Email already registered', 'EMAIL_EXISTS');
        }
        
        // Hash password
        const password_hash = await bcrypt.hash(password, 10);
        
        // Create user
        const user = await User.create({
            email,
            password_hash,
            first_name,
            last_name,
            phone,
            address,
            city,
            state,
            zip_code,
            country,
            role: 'user',
            is_active: true
        });
        
        // Generate token
        const token = generateToken(user.id);
        
        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password_hash;
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: userResponse
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 * 
 * @async
 * @function login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const login = async (req, res, next) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validation error', 'VALIDATION_ERROR', errors.array());
        }
        
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new ApiError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
        }
        
        // Check if user is active
        if (!user.is_active) {
            throw new ApiError(401, 'Account is deactivated', 'ACCOUNT_INACTIVE');
        }
        
        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new ApiError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
        }
        
        // Generate token
        const token = generateToken(user.id);
        
        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password_hash;
        
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userResponse
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user profile
 * 
 * @async
 * @function getProfile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: { exclude: ['password_hash'] }
        });
        
        if (!user) {
            throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
        }
        
        res.json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update user profile
 * 
 * @async
 * @function updateProfile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateProfile = async (req, res, next) => {
    try {
        const { 
            first_name, 
            last_name, 
            phone, 
            address, 
            city, 
            state, 
            zip_code, 
            country,
            password 
        } = req.body;
        
        const user = await User.findByPk(req.userId);
        if (!user) {
            throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
        }
        
        // Prepare update data
        const updateData = {
            first_name,
            last_name,
            phone,
            address,
            city,
            state,
            zip_code,
            country
        };
        
        // Remove undefined values
        Object.keys(updateData).forEach(key => 
            updateData[key] === undefined && delete updateData[key]
        );
        
        // Update password if provided
        if (password) {
            updateData.password_hash = await bcrypt.hash(password, 10);
        }
        
        await user.update(updateData);
        
        // Get updated user without password
        const updatedUser = await User.findByPk(req.userId, {
            attributes: { exclude: ['password_hash'] }
        });
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
};