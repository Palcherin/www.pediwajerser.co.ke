const express = require('express');
const router = express.Router();
const {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoriesControllers');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Public: list categories
router.get('/', getAllCategories);

// Admin: create
router.post('/', authenticate, authorizeAdmin, createCategory);

// Admin: update (slug stays the same so existing products keep working)
router.put('/:id', authenticate, authorizeAdmin, updateCategory);

// Admin: delete (blocked while products still use it)
router.delete('/:id', authenticate, authorizeAdmin, deleteCategory);

module.exports = router;