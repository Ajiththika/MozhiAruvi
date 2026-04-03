import express from 'express';
import { getAiResponse } from '../services/aiChatService.js';

const router = express.Router();

/**
 * AI Chat Interaction
 * POST /api/ai/chat
 */
router.post('/chat', async (req, res, next) => {
    try {
        const { message, chatHistory } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: "No message detected. Please speak to MozhiAruvi." });
        }

        const data = await getAiResponse(message, chatHistory || []);
        res.json({ response: data });

    } catch (e) {
        console.error('AI Route Error:', e);
        res.status(500).json({ error: "The AI brain is having a moment. Please wait." });
    }
});

export default router;
