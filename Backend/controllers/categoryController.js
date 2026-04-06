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

        const existing = await Category.findOne({ 
            name: { $regex: new RegExp(`^${name.trim()}$`, "i") } 
        });
        if (existing) {
            return res.status(400).json({ message: "Category name already exists" });
        }

        const category = await Category.create({ name, description, orderIndex });
        res.status(201).json({ category });
    } catch (e) {
        next(e);
    }
}

export async function deleteCategory(req, res, next) {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Category deleted" });
    } catch (e) { next(e); }
}

export async function updateCategory(req, res, next) {
    try {
        const { name, description, orderIndex, icon } = req.body;
        const id = req.params.id;

        if (name) {
            const existing = await Category.findOne({ 
                name: { $regex: new RegExp(`^${name.trim()}$`, "i") }, 
                _id: { $ne: id } 
            });
            if (existing) {
                return res.status(400).json({ message: "Category name already exists" });
            }
        }

        const category = await Category.findByIdAndUpdate(
            id,
            { name, description, orderIndex, icon },
            { new: true, runValidators: true }
        );
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.json({ category });
    } catch (e) {
        next(e);
    }
}
