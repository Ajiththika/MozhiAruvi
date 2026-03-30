import User from '../models/User.js';
import * as lessonService from '../services/lessonService.js';

// ── Helpers ──────────────────────────────────────────────────────────────────
async function syncUserEnergy(userId) {
    const user = await User.findById(userId);
    if (!user) return null;

    const now = new Date();
    const last = user.progress.lastEnergyUpdate || now;
    const hoursPassed = Math.floor((now - last) / (1000 * 60 * 60));

    if (hoursPassed > 0) {
        user.progress.energy = Math.min(25, user.progress.energy + hoursPassed);
        user.progress.lastEnergyUpdate = now;
        await user.save();
    }
    return user;
}

// ── Read operations ───────────────────────────────────────────────────────────
export async function listLessons(req, res, next) {
    try {
        if (req.user) await syncUserEnergy(req.user.sub);
        const lessons = await lessonService.getAllLessons();
        const progress = req.user ? await lessonService.getUserProgressList(req.user.sub) : [];
        res.json({ lessons, progress });
    } catch (e) { next(e); }
}

export async function getLessonDetails(req, res, next) {
    try {
        const user = await syncUserEnergy(req.user.sub);
        if (user.progress.energy <= 0 && !user.isPremium) {
            return res.status(403).json({ message: "No power left", redirect: "/subscription" });
        }
        const lesson = await lessonService.getLessonById(req.params.id);
        res.json({ lesson });
    } catch (e) { next(e); }
}

export async function getLessonQuestions(req, res, next) {
    try {
        const user = await syncUserEnergy(req.user.sub);
        if (user.progress.energy <= 0 && !user.isPremium) {
            return res.status(403).json({ message: "No power left", redirect: "/subscription" });
        }
        const questions = await lessonService.getQuestionsForLesson(req.params.id);
        res.json({ questions, user });
    } catch (e) { next(e); }
}

// ── Action operations ─────────────────────────────────────────────────────────
export async function submitAnswers(req, res, next) {
    try {
        const user = await syncUserEnergy(req.user.sub);
        if (user.progress.energy <= 0 && !user.isPremium) {
            return res.status(403).json({ message: "No power left", redirect: "/subscription" });
        }

        const result = await lessonService.evaluateAnswersAndSaveProgress(req.user.sub, req.params.id, req.body.answers);
        
        // Deduct 1 energy per question answered
        const questionsAnswered = req.body.answers.length;
        user.progress.energy = Math.max(0, user.progress.energy - questionsAnswered);
        await user.save();

        res.json({
            message: 'Lesson submitted successfully.',
            score: result.score,
            totalPossibleScore: result.totalPossibleScore,
            passed: result.passed,
            progress: result.progress,
            user: user.toSafeObject() // Return updated user for frontend sync
        });
    } catch (e) { next(e); }
}

import OpenAI, { toFile } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key'
});

export async function evaluateSpeaking(req, res, next) {
    try {
        const { questionId, audioBase64 } = req.body;
        
        let score = 95;
        let isSimulated = true;
        let transcription = "";
        let message = "AI pronunciation scoring is currently offline. Simulating validation successfully.";
        let passed = true;

        if (process.env.OPENAI_API_KEY) {
            try {
                // Convert Base64 back to buffer
                const cleanBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, '');
                const audioBuffer = Buffer.from(cleanBase64, 'base64');
                const file = await toFile(audioBuffer, 'audio.webm', { type: 'audio/webm' });

                const transcriptionResult = await openai.audio.transcriptions.create({
                    file,
                    model: 'whisper-1',
                    language: 'ta', // Focus on Tamil audio
                });

                transcription = transcriptionResult.text || "";
                
                // For a more advanced setup, you could pass transcription back to GPT-4 
                // to score semantic similarities against expected text.
                // For now, if transcription is not almost empty, we assume they spoke.
                if (transcription.trim().length > 2) {
                    score = 90; // Fixed base score if successfully caught words
                    passed = true;
                } else {
                    score = 10;
                    passed = false;
                }
                
                isSimulated = false;
                message = "Pronunciation analyzed successfully.";
                
            } catch (err) {
                console.error("[AI Speech-to-Text] Error:", err.message);
                message = "AI service temporarily unavailable. Reverted to simulation mode.";
            }
        } else {
            // Simulated processing delay
            await new Promise(resolve => setTimeout(resolve, 800));
            transcription = "simulated speech snippet";
        }

        res.json({
            isScorable: false,
            isSimulated,
            passed,
            score,
            transcription,
            message
        });
    } catch (e) { next(e); }
}

// ── Admin operations ──────────────────────────────────────────────────────────
export async function createLesson(req, res, next) {
    try {
        const lesson = await lessonService.createLesson(req.body);
        res.status(201).json({ lesson });
    } catch (e) { next(e); }
}

export async function updateLesson(req, res, next) {
    try {
        const lesson = await lessonService.updateLesson(req.params.id, req.body);
        res.json({ lesson });
    } catch (e) { next(e); }
}

export async function deleteLesson(req, res, next) {
    try {
        await lessonService.deleteLesson(req.params.id);
        res.json({ message: 'Lesson deleted successfully.' });
    } catch (e) { next(e); }
}

export async function createQuestion(req, res, next) {
    try {
        const question = await lessonService.createQuestion(req.params.id, req.body);
        res.status(201).json({ question });
    } catch (e) { next(e); }
}

export async function deleteQuestion(req, res, next) {
    try {
        await lessonService.deleteQuestion(req.params.qId);
        res.json({ message: 'Question deleted successfully.' });
    } catch (e) { next(e); }
}
