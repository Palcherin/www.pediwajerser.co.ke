const fs = require('fs');
const path = require('path');
const { HeroSlide } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

// Multipart bodies arrive as strings, so convert types here
const pick = (b) => {
    const out = {};
    ['tag', 'title', 'subtitle', 'cta', 'link', 'accent', 'bg_color'].forEach(k => {
        if (b[k] !== undefined) out[k] = b[k];
    });
    if (b.sort_order !== undefined) out.sort_order = Number(b.sort_order) || 0;
    if (b.is_active !== undefined) out.is_active = b.is_active === true || b.is_active === 'true';
    return out;
};

const removeFile = (img) => {
    if (img && img.startsWith('/uploads/hero/')) {
        fs.unlink(path.join(__dirname, '..', 'public', img), () => {});
    }
};

// Public: only active slides, in order
const getActiveSlides = async (req, res, next) => {
    try {
        const slides = await HeroSlide.findAll({
            where: { is_active: true },
            order: [['sort_order', 'ASC'], ['id', 'ASC']]
        });
        res.json({ success: true, slides });
    } catch (error) { next(error); }
};

// Admin: everything
const getAllSlides = async (req, res, next) => {
    try {
        const slides = await HeroSlide.findAll({ order: [['sort_order', 'ASC'], ['id', 'ASC']] });
        res.json({ success: true, slides });
    } catch (error) { next(error); }
};

const createSlide = async (req, res, next) => {
    try {
        if (!req.file) throw new ApiError(400, 'Slide image is required', 'IMAGE_REQUIRED');
        if (!req.body.title) {
            removeFile(`/uploads/hero/${req.file.filename}`);
            throw new ApiError(400, 'Title is required', 'TITLE_REQUIRED');
        }
        const slide = await HeroSlide.create({
            ...pick(req.body),
            image: `/uploads/hero/${req.file.filename}`
        });
        res.status(201).json({ success: true, slide });
    } catch (error) { next(error); }
};

const updateSlide = async (req, res, next) => {
    try {
        const slide = await HeroSlide.findByPk(req.params.id);
        if (!slide) throw new ApiError(404, 'Slide not found', 'SLIDE_NOT_FOUND');

        const data = pick(req.body);
        if (req.file) {
            removeFile(slide.image); // delete the old upload
            data.image = `/uploads/hero/${req.file.filename}`;
        }
        await slide.update(data);
        res.json({ success: true, slide });
    } catch (error) { next(error); }
};

const deleteSlide = async (req, res, next) => {
    try {
        const slide = await HeroSlide.findByPk(req.params.id);
        if (!slide) throw new ApiError(404, 'Slide not found', 'SLIDE_NOT_FOUND');
        removeFile(slide.image);
        await slide.destroy();
        res.json({ success: true, message: 'Slide deleted' });
    } catch (error) { next(error); }
};

module.exports = { getActiveSlides, getAllSlides, createSlide, updateSlide, deleteSlide };