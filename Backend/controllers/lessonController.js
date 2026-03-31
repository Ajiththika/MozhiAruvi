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
        
        // Count incorrect answers to deduct energy, or 1 if failed
        const mistakes = (result.results || []).filter(r => !r.correct).length;
        if (mistakes > 0) {
            user.progress.energy = Math.max(0, user.progress.energy - mistakes);
            await user.save();
        }

        res.json({
            message: 'Lesson submitted successfully.',
            score: result.score,
            total: result.totalPossibleScore,
            passed: result.passed,
            progress: result.progress,
            nextLessonId: result.nextLessonId,
            user: user.toSafeObject() // Return updated user for frontend sync
        });
    } catch (e) { next(e); }
}

import speech from '@google-cloud/speech';
import tts from '@google-cloud/text-to-speech';
import { stringSimilarity } from 'string-similarity-js';
import Question from '../models/Question.js';

// Lazy client getters — avoids crashing the server at startup when
// Google Cloud credentials are not configured.
function getTTSClient() {
    try { return new tts.TextToSpeechClient(); }
    catch (e) { console.warn('[Google TTS] Client unavailable:', e.message); return null; }
}

function getSpeechClient() {
    try { return new speech.SpeechClient(); }
    catch (e) { console.warn('[Google STT] Client unavailable:', e.message); return null; }
}

export async function generateSpeech(req, res, next) {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: "Text is required" });

        const ttsClient = getTTSClient();
        if (!ttsClient) {
            return res.status(503).json({ message: "Speech synthesis is not configured on this server." });
        }

        const request = {
            input: { text },
            voice: { languageCode: 'ta-IN', ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'MP3' },
        };

        const [response] = await ttsClient.synthesizeSpeech(request);
        const audioBase64 = response.audioContent.toString('base64');
        res.json({ audioUrl: `data:audio/mp3;base64,${audioBase64}` });
    } catch (e) {
        console.error("[Google TTS Error]:", e.message);
        next(e);
    }
}

export async function evaluateSpeaking(req, res, next) {
    try {
        const { questionId, audioBase64 } = req.body;
        const question = await Question.findById(questionId);
        if (!question) return res.status(404).json({ message: "Question not found" });

        const speechClient = getSpeechClient();
        if (!speechClient) {
            return res.status(503).json({ message: "Speech recognition is not configured on this server." });
        }

        const expectedText = question.expectedAudioText || question.text;
        const cleanBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, '');

        const audio = { content: cleanBase64 };
        const config = {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: 'ta-IN',
        };
        const request = { audio, config };

        let transcription = "";
        let score = 0;
        let passed = false;
        let feedback = "No speech detected. Please try again.";

        try {
            const [response] = await speechClient.recognize(request);
            transcription = response.results
                .map(result => result.alternatives[0].transcript)
                .join('\n');

            if (transcription) {
                const normalizedExpected = expectedText.trim().toLowerCase();
                const normalizedUser = transcription.trim().toLowerCase();

                score = stringSimilarity(normalizedExpected, normalizedUser) * 100;
                passed = score >= 70;

                feedback = passed
                    ? (score > 90 ? "Excellent pronunciation!" : "Good job! Almost perfect.")
                    : "Not quite. Listen and try again.";
            }
        } catch (err) {
            console.error("[Google STT Error]:", err.message);
            return res.status(500).json({ message: "Speech recognition failed" });
        }

        res.json({
            isCorrect: passed,
            score: Math.round(score),
            correctText: expectedText,
            transcription,
            feedback
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
