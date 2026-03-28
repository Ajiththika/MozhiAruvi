import * as lessonService from '../services/lessonService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import OpenAI, { toFile } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key'
});

// ── Read operations ───────────────────────────────────────────────────────────
export const listLessons = asyncHandler(async (req, res) => {
    const lessons = await lessonService.getAllLessons();
    const progress = await lessonService.getUserProgressList(req.user.sub);
    res.json({ lessons, progress });
});

export const getLessonDetails = asyncHandler(async (req, res) => {
    const lesson = await lessonService.getLessonById(req.params.id);
    res.json({ lesson });
});

export const getLessonQuestions = asyncHandler(async (req, res) => {
    // We omit the correctOptionIndex from the response so users can't cheat
    const questions = await lessonService.getQuestionsForLesson(req.params.id);
    res.json({ questions });
});

// ── Action operations ─────────────────────────────────────────────────────────
export const submitAnswers = asyncHandler(async (req, res) => {
    const result = await lessonService.evaluateAnswersAndSaveProgress(req.user.sub, req.params.id, req.body.answers);
    res.json({
        message: 'Lesson submitted successfully.',
        score: result.score,
        totalPossibleScore: result.totalPossibleScore,
        passed: result.passed,
        progress: result.progress
    });
});

export const evaluateSpeaking = asyncHandler(async (req, res) => {
    const { questionId, audioBase64 } = req.body;
    
    let score = 95;
    let isSimulated = true;
    let transcription = "";
    let message = "AI pronunciation scoring is currently offline. Simulating validation successfully.";
    let passed = true;

    if (process.env.OPENAI_API_KEY) {
        try {
            // Convert Base64 back to buffer
            const audioBuffer = Buffer.from(audioBase64, 'base64');
            const file = await toFile(audioBuffer, 'audio.webm', { type: 'audio/webm' });

            const transcriptionResult = await openai.audio.transcriptions.create({
                file,
                model: 'whisper-1',
                language: 'ta', // Focus on Tamil audio
            });

            transcription = transcriptionResult.text || "";
            
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
});

// ── Admin operations ──────────────────────────────────────────────────────────
export const createLesson = asyncHandler(async (req, res) => {
    const lesson = await lessonService.createLesson(req.body);
    res.status(201).json({ lesson });
});

export const updateLesson = asyncHandler(async (req, res) => {
    const lesson = await lessonService.updateLesson(req.params.id, req.body);
    res.json({ lesson });
});

export const deleteLesson = asyncHandler(async (req, res) => {
    await lessonService.deleteLesson(req.params.id);
    res.json({ message: 'Lesson deleted successfully.' });
});

export const createQuestion = asyncHandler(async (req, res) => {
    const question = await lessonService.createQuestion(req.params.id, req.body);
    res.status(201).json({ question });
});
