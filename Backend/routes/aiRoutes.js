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
            return res.status(400).json({ 
                success: false, 
                error: "NO_MESSAGE", 
                message: "No message detected. Please speak to MozhiAruvi." 
            });
        }

        const data = await getAiResponse(message, chatHistory || []);
        
        // Ensure we always return a success flag for the UI, 
        // using the response string to convey any "soft" errors.
        res.json({ 
            success: true,
            response: data 
        });

    } catch (e) {
        console.error('❌ [AI ROUTE CRASH]:', e);
        
        // Even in crash scenarios, we try to return a graceful response to the user
        // so the chat bubble doesn't just show a 500 error.
        res.status(200).json({ 
            success: true,
            response: "MozhiAruvi is currently meditating on ancient texts. Please give her a moment to return to the river (Linguistic flow interrupted)." 
        });
    }
});

export default router;
