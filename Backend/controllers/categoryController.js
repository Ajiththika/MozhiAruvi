import Category from '../models/Category.js';

export async function listCategories(req, res, next) {
    try {
        const categories = await Category.find().sort({ orderIndex: 1, name: 1 });
        res.json({ categories });
    } catch (e) { next(e); }
}

export async function createCategory(req, res, next) {
    try {
        const { name, description, orderIndex } = req.body;
        if (!name) return res.status(400).json({ message: "Name is required" });
        const category = await Category.create({ name, description, orderIndex });
        res.status(201).json({ category });
    } catch (e) {
        if (e.code === 11000) return res.status(400).json({ message: "Category name already exists" });
        next(e);
    }
}

export async function deleteCategory(req, res, next) {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Category deleted" });
    } catch (e) { next(e); }
}
