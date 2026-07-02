/**
 * User Controller
 * 
 * Handles all user management operations (admin only)
 * 
 * @module controllers/userController
 */

const { User } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const bcrypt = require('bcryptjs');

/**
 * Get all users with pagination
 * 
 * @async
 * @function getAllUsers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllUsers = async (req, res, next) => {
    try {
        const { limit = 20, offset = 0, search, role } = req.query;
        
        const where = {};
        if (search) {
            where[Op.or] = [
                { first_name: { [Op.iLike]: `%${search}%` } },
                { last_name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }
        if (role) {
            where.role = role;
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password_hash'] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            total: count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            users: rows
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user by ID
 * 
 * @async
 * @function getUserById
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const user = await User.findByPk(id, {
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
 * Update user (admin only)
 * 
 * @async
 * @function updateUser
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, phone, role, is_active, password } = req.body;
        
        const user = await User.findByPk(id);
        if (!user) {
            throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
        }
        
        // Update user
        const updateData = {
            first_name,
            last_name,
            email,
            phone,
            role,
            is_active
        };
        
        // Remove undefined values
        Object.keys(updateData).forEach(key => 
            updateData[key] === undefined && delete updateData[key]
        );
        
        // Handle password update
        if (password) {
            updateData.password_hash = await bcrypt.hash(password, 10);
        }
        
        await user.update(updateData);
        
        // Get updated user without password
        const updatedUser = await User.findByPk(id, {
            attributes: { exclude: ['password_hash'] }
        });
        
        res.json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete user (soft delete)
 * 
 * @async
 * @function deleteUser
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const user = await User.findByPk(id);
        if (!user) {
            throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
        }
        
        // Prevent deleting self
        if (user.id === req.userId) {
            throw new ApiError(400, 'Cannot delete your own account', 'SELF_DELETE');
        }
        
        await user.destroy(); // Soft delete if paranoid: true
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};