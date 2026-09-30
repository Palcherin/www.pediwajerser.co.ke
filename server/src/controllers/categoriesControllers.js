const { Category, Product } = require('../models');

const slugify = (s) =>
    String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// GET /api/categories (public)
const getAllCategories = async (req, res, next) => {
    try {
        const rows = await Category.findAll({ order: [['name', 'ASC']] });
        res.json({ success: true, data: rows });
    } catch (err) {
        next(err);
    }
};

// POST /api/categories (admin)
// Uses the slug from the dashboard form if given, otherwise builds it from the name
const createCategory = async (req, res, next) => {
    try {
        const { name, slug: rawSlug, description, image } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Category name is required' });
        }

        const slug = slugify(rawSlug && rawSlug.trim() ? rawSlug : name);
        if (!slug) {
            return res.status(400).json({ success: false, message: 'Could not build a valid slug from this name' });
        }

        if (await Category.findOne({ where: { slug } })) {
            return res.status(409).json({ success: false, message: 'A category with this name or slug already exists' });
        }

        const cat = await Category.create({
            name: name.trim(),
            slug,
            description: description || null,
            image: image || null,
        });
        res.status(201).json({ success: true, data: cat });
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ success: false, message: 'A category with this name or slug already exists' });
        }
        next(err);
    }
};

// PUT /api/categories/:id (admin)
// Slug stays the same so existing products keep working
const updateCategory = async (req, res, next) => {
    try {
        const cat = await Category.findByPk(req.params.id);
        if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });

        const { name, description, image } = req.body;
        await cat.update({
            name: name?.trim() || cat.name,
            description: description ?? cat.description,
            image: image ?? cat.image,
        });
        res.json({ success: true, data: cat });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/categories/:id (admin)
// Blocked while products still use the category
const deleteCategory = async (req, res, next) => {
    try {
        const cat = await Category.findByPk(req.params.id);
        if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });

        const inUse = await Product.count({ where: { categorySlug: cat.slug } });
        if (inUse > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete: ${inUse} product(s) use this category`,
            });
        }

        await cat.destroy();
        res.json({ success: true, message: 'Category deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };