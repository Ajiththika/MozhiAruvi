import * as lessonService from '../services/lessonService.js';

// ── Read operations ───────────────────────────────────────────────────────────
export async function listLessons(req, res, next) {
    try {
        const lessons = await lessonService.getAllLessons();
        const progress = await lessonService.getUserProgressList(req.user.sub);
        res.json({ lessons, progress });
    } catch (e) { next(e); }
}

export async function getLessonDetails(req, res, next) {
    try {
        const lesson = await lessonService.getLessonById(req.params.id);
        res.json({ lesson });
    } catch (e) { next(e); }
}

export async function getLessonQuestions(req, res, next) {
    try {
        // We omit the correctOptionIndex from the response so users can't cheat
        const questions = await lessonService.getQuestionsForLesson(req.params.id);
        res.json({ questions });
    } catch (e) { next(e); }
}

// ── Action operations ─────────────────────────────────────────────────────────
export async function submitAnswers(req, res, next) {
    try {
        const result = await lessonService.evaluateAnswersAndSaveProgress(req.user.sub, req.params.id, req.body.answers);
        res.json({
            message: 'Lesson submitted successfully.',
            score: result.score,
            totalPossibleScore: result.totalPossibleScore,
            passed: result.passed,
            progress: result.progress
        });
    } catch (e) { next(e); }
}

export async function evaluateSpeaking(req, res, next) {
    try {
        const { questionId, audioBase64 } = req.body;
        // In the future, send audioBase64 to an external Speech-to-Text / Pronunciation scoring API
        // For now, simulate the integration honestly
        
        let score = 95; // Simulated
        let isSimulated = true;
        let transcription = "simulated speech";
        
        // Simulating processing delay
        await new Promise(resolve => setTimeout(resolve, 800));

        res.json({
            isScorable: false,
            isSimulated,
            passed: true,
            score,
            transcription,
            message: "AI pronunciation scoring is currently offline. Simulating validation successfully."
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
