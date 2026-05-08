import express from 'express';
import Feedback from '../models/Feedback.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Public (or protected if you want to link to user)
router.post('/', async (req, res) => {
    try {
        const { rating, comment, userEmail, userId } = req.body;

        if (!rating || !userEmail) {
            return res.status(400).json({ message: 'Rating and email are required' });
        }

        const feedback = await Feedback.create({
            rating,
            comment,
            userEmail,
            userId
        });

        res.status(201).json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (feedback) {
            await feedback.deleteOne();
            res.json({ message: 'Feedback removed' });
        } else {
            res.status(404).json({ message: 'Feedback not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
