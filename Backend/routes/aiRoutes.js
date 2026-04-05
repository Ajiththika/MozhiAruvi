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
        console.error('AI Route Error (Handled):', e.message || e);
        // Fallback response with 200 OK to prevent Axios break in frontend
        res.json({ 
            response: "MozhiAruvi is currently meditating on ancient texts. Please give her a moment to return to the river (Hub connectivity issue)." 
        });
    }
});

export default router;
