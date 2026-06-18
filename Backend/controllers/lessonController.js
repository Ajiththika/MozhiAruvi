import User from '../models/User.js';
import * as lessonService from '../services/lessonService.js';
import { canAttempt, consumeEnergy, getEnergyResponse, regenerateEnergy, validateStreak } from '../utils/energyManager.js';
import speech from '@google-cloud/speech';
import { gradeSpeech } from '../utils/speechMatch.js';
import { synthesizeTamilSpeech } from '../services/ttsService.js';
import Question from '../models/Question.js';
import QuestionAttempt from '../models/QuestionAttempt.js';
import { evaluateQuestionAnswer, getRevealAnswer } from '../utils/sanitizeQuestion.js';

/** Upsert a server-verified attempt record for async-graded question types. */
async function recordVerifiedAttempt(userId, question, verified, score = 0) {
    if (!userId || !question?._id) return;
    try {
        await QuestionAttempt.findOneAndUpdate(
            { userId, questionId: question._id },
            {
                $set: {
                    lessonId: question.lessonId,
                    type: question.type,
                    verified: !!verified,
                    score: score || 0,
                },
            },
            { upsert: true }
        );
    } catch (e) {
        console.error('[recordVerifiedAttempt] failed:', e.message);
    }
}
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Read operations ───────────────────────────────────────────────────────────
export async function listLessons(req, res, _next) {
    try {
        if (req.user) {
            const user = await User.findById(req.user.sub);
            if (user) {
                const modEnergy = regenerateEnergy(user);
                const modStreak = validateStreak(user);
                if (modEnergy || modStreak) await user.save();
            }
        }
        const lessons = await lessonService.getAllLessons();
        const progress = req.user ? await lessonService.getUserProgressList(req.user.sub) : [];
        res.json({ lessons, progress });
    } catch (e) { 
        console.error('❌ [LIST LESSONS ERROR]:', e.message, e.stack);
        _next(e); 
    }
}

export async function getLessonDetails(req, res, next) {
    try {
        const user = req.user ? await User.findById(req.user.sub) : null;
        if (user) {
            const { canAttempt: possible, nextRecoveryIn } = canAttempt(user);
            await user.save();
            if (!possible) {
                return res.status(403).json({ 
                    success: false, 
                    error: "NO_ENERGY",
                    message: "No power left.", 
                    redirect: "/subscription", 
                    nextRecoveryIn 
                });
            }
        }
        const lesson = await lessonService.getLessonById(req.params.id);
        res.json({ lesson });
    } catch (e) { 
        console.error('❌ [GET LESSON DETAILS ERROR]:', e.message, e.stack);
        next(e); 
    }
}

export async function getLessonQuestions(req, res, next) {
    try {
        const user = await User.findById(req.user?.sub);
        if (user) {
            const { canAttempt: possible, nextRecoveryIn } = canAttempt(user);
            await user.save();
            if (!possible) {
                return res.status(403).json({ 
                    success: false,
                    error: "NO_ENERGY",
                    message: "No power left.", 
                    redirect: "/subscription", 
                    nextRecoveryIn 
                });
            }
        }
        const lesson = await lessonService.getLessonById(req.params.id);
        
        // Strict Level Gating: Student level must match Lesson level
        if (user && lesson.level) {
            const userLevel = user.level || 'Beginner';
            const sameLevel = userLevel.toLowerCase() === lesson.level.toLowerCase();
            const isBegEq = false; // Legacy check for Basic level removed
            
            if (!sameLevel && !isBegEq && user.role !== 'admin') {
                return res.status(403).json({ 
                    success: false,
                    message: `This lesson is for ${lesson.level} students. Your level is ${userLevel}.`,
                    redirect: "/student/dashboard"
                });
            }
        }

        const questions = await lessonService.getQuestionsForLesson(req.params.id, user?.role === 'admin');
        res.json({ 
            questions, 
            user: user?.toSafeObject ? user.toSafeObject() : user,
            energy: user ? getEnergyResponse(user) : null
        });
    } catch (e) { 
        console.error('❌ [LESSON CONTROLLER ERROR]:', e.message, e.stack);
        next(e); 
    }
}

// ── Action operations ─────────────────────────────────────────────────────────
export async function submitAnswers(req, res, next) {
    try {
        const user = await User.findById(req.user?.sub);
        if (user) {
            const { canAttempt: possible, nextRecoveryIn } = canAttempt(user);
            if (!possible) {
                return res.status(403).json({ error: "NO_ENERGY", redirect: "/subscription", nextRecoveryIn });
            }
        }

        const { answers } = req.body;
        if (!answers) return res.status(400).json({ message: "Answers are required" });

        const result = await lessonService.evaluateAnswersAndSaveProgress(req.user.sub, req.params.id, answers);
        
        if (user) {
            consumeEnergy(user);   // deduct 1 per lesson submission (per-attempt deduction)
            await user.save();
        }

        res.json({
            message: 'Lesson submitted successfully.',
            score: result.score,
            total: result.totalPossibleScore,
            passed: result.passed,
            xpEarned: result.xpEarned || 0,
            progress: result.progress,
            nextLessonId: result.nextLessonId,
            user: result.user || user?.toSafeObject(),
            energy: user ? getEnergyResponse(user) : null
        });
    } catch (e) { next(e); }
}

/** POST /api/lessons/:id/questions/:qId/check — server-side answer validation */
export async function checkQuestionAnswer(req, res, next) {
    try {
        const question = await Question.findById(req.params.qId);
        if (!question || question.lessonId.toString() !== req.params.id) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const { selectedOptionIndex, typedAnswer, isSpeakingCompleted, matchingAnswer } = req.body;
        const correct = evaluateQuestionAnswer(question, {
            selectedOptionIndex,
            typedAnswer,
            isSpeakingCompleted,
            matchingAnswer,
        });

        // Persist match results so the final submit reflects the verified server grade.
        if (question.type === 'match') {
            await recordVerifiedAttempt(req.user?.sub, question, correct, correct ? (question.scoreValue || 10) : 0);
        }

        res.json({
            correct,
            correctAnswer: correct ? undefined : getRevealAnswer(question),
            hint: correct ? undefined : question.hint,
            explanation: question.explanation,
            xp: correct ? (question.xp || question.scoreValue || 10) : 0,
        });
    } catch (e) {
        next(e);
    }
}

// ── Google Cloud Integration Utilities ─────────────────────────────────────────

function logGoogleError(type, err) {
    try {
        const logDir = path.resolve('logs');
        const logFile = path.join(logDir, 'google.log');
        const msg = `[${new Date().toISOString()}] [${type}] ${err.message}\n` + (err.stack ? `${err.stack}\n` : '');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
        fs.appendFileSync(logFile, msg);
    } catch(e) { console.error("Google Log Failure", e.message); }
}

/**
 * Circuit-breaker flags: once Google rejects auth (code 16), we stop
 * attempting API calls for the rest of the server session to avoid
 * flooding the console and unnecessary network traffic.
 */
let _ttsDisabled = false;
let _sttDisabled = false;

export function markGoogleDisabled(service, err) {
    const isAuthError = err.code === 16 || (err.message || '').includes('UNAUTHENTICATED');
    const isPermError = err.code === 7  || (err.message || '').includes('PERMISSION_DENIED');
    if (isAuthError || isPermError) {
        const reason = isAuthError ? 'Service account key rejected (UNAUTHENTICATED)' : 'API not enabled (PERMISSION_DENIED)';
        if (service === 'TTS' && !_ttsDisabled) {
            _ttsDisabled = true;
            console.warn(`[Google TTS] Disabled for this session. Reason: ${reason}. Browser TTS fallback is active.`);
            console.warn('[Google TTS] To fix: regenerate your service account key at https://console.cloud.google.com/iam-admin/serviceaccounts');
        }
        if (service === 'STT' && !_sttDisabled) {
            _sttDisabled = true;
            console.warn(`[Google STT] Disabled for this session. Reason: ${reason}. Simulation mode is active.`);
        }
        logGoogleError(`Google ${service} AUTH FAILURE`, err);
        return true;
    }
    return false;
}

/**
 * Resolved absolute path for Google Credentials.
 * If set in ENV, we resolve it relative to the process root.
 */
function resolveCredentials() {
    try {
        let rawPath = (process.env.GOOGLE_APPLICATION_CREDENTIALS || '').trim();
        if (!rawPath) {
            console.warn('[Google Auth] GOOGLE_APPLICATION_CREDENTIALS not set in environment.');
            return null;
        }

        // Clean quotes if present
        rawPath = rawPath.replace(/^["']|["']$/g, '');

        // Candidate paths to check
        const candidates = [
            // 1. Direct absolute path
            path.isAbsolute(rawPath) ? rawPath : null,
            // 2. Relative to this file (controllers/lessonController.js -> ../)
            path.resolve(__dirname, '..', rawPath.replace(/^\.\//, '')),
            // 3. Relative to process cwd
            path.resolve(process.cwd(), rawPath),
            // 4. Fallback: Check Backend parent from CWD if running from root
            path.resolve(process.cwd(), 'Backend', rawPath.replace(/^\.\//, ''))
        ].filter(Boolean);

        for (const candidate of candidates) {
            if (fs.existsSync(candidate)) {
                return candidate;
            }
        }

        console.warn(`[Google Auth] Credential file not found. Checked: ${candidates.join(', ')}`);
        return null;
    } catch (e) {
        console.error('[Google Auth] Path resolution error:', e.message);
        return null;
    }
}

function getCredentialsObject() {
    const keyPath = resolveCredentials();
    if (!keyPath) return null;
    try {
        const content = fs.readFileSync(keyPath, 'utf8');
        return JSON.parse(content);
    } catch (e) {
        console.error('[Google Auth] Error reading/parsing credential JSON:', e.message);
        return null;
    }
}

export function getSpeechClient() {
    try { 
        const json = getCredentialsObject();
        if (!json) return null;
        
        // Ensure private key handles literal newlines correctly
        const private_key = (json.private_key || '').replace(/\\n/g, '\n');
        
        const client = new speech.SpeechClient({ 
            credentials: {
                client_email: json.client_email,
                private_key: private_key
            },
            projectId: json.project_id
        }); 
        
        // Log initialization once
        if (!_sttDisabled) {
            console.log(`[Google STT] Initialized with account: ${json.client_email}`);
        }
        return client;
    }
    catch (e) { 
        console.warn('[Google STT] Client unavailable:', e.message); 
        logGoogleError("Google STT Client Initialization", e);
        return null; 
    }
}


export async function evaluateSpeaking(req, res, next) {
    try {
        const { questionId, audioBase64 } = req.body;
        if (!audioBase64) return res.status(400).json({ message: "Audio data is required" });

        const question = await Question.findById(questionId);
        if (!question) return res.status(404).json({ message: "Question not found" });

        const expectedText = (question.correctAnswer || question.tamilWord || question.expectedAudioText || "").trim();
        // Strip ANY data-URL header (handles "data:audio/webm;codecs=opus;base64," etc).
        // base64 never contains a comma, so removing everything up to the first comma is safe.
        const cleanBase64 = audioBase64.replace(/^data:[^,]*,/, '');
        
        let transcription = "";
        let sttConfidence = null;
        
        // ── 1. Attempt AI Processing (Google Speech API) ───────────────────────
        try {
            const speechClient = !_sttDisabled ? getSpeechClient() : null;
            if (speechClient) {
                const [sttResponse] = await speechClient.recognize({
                    config: {
                        encoding: 'WEBM_OPUS',
                        sampleRateHertz: 48000,
                        languageCode: 'ta-IN',
                        enableAutomaticPunctuation: true,
                    },
                    audio: { content: cleanBase64 }
                });

                if (sttResponse.results && sttResponse.results.length > 0) {
                    transcription = sttResponse.results
                        .map(result => result.alternatives?.[0]?.transcript || "")
                        .join(' ')
                        .trim();

                    // Average the per-result confidence scores (0..1) for thresholding.
                    const confs = sttResponse.results
                        .map(result => result.alternatives?.[0]?.confidence)
                        .filter(c => typeof c === 'number' && c > 0);
                    if (confs.length > 0) {
                        sttConfidence = confs.reduce((a, b) => a + b, 0) / confs.length;
                    }
                }
            }
        } catch (sttErr) {
            markGoogleDisabled('STT', sttErr);
        }

        // ── 2. Handle Empty Transcription ────────────────────────────────────
        if (!transcription) {
            // If the AI didn't catch anything, we don't guess. 
            // We let the evaluation logic below handle the empty string (which will result in 'Incorrect').
            transcription = "";
        }


        // ── 3. Multi-tier Evaluation (lenient / mic-forgiving) ───────────────
        // Fuzzy Tamil matching (Levenshtein + Dice) → percentage similarity, graded into:
        //   perfect (>=90%) · close (65-89%, partial credit, no penalty) · retry (<65%)
        const { score, status, passed, feedback, confidence } = gradeSpeech(
            expectedText,
            transcription,
            question.phoneticHint || "",
            sttConfidence
        );

        // Persist the authoritative server result so the final lesson submit
        // evaluates this stored verification, not a client-trusted boolean.
        await recordVerifiedAttempt(req.user?.sub, question, passed, score || 0);

        return res.json({
            isCorrect: passed,           // perfect & close both pass → never boot the learner out
            status,                      // 'perfect' | 'close' | 'retry'
            score: score || 0,
            confidence,                  // STT recognition confidence (0..1 or null)
            correctText: expectedText,
            transcription: transcription || "",   // captured (possibly mispronounced) phonetic string
            feedback
        });


    } catch (e) { 
        console.error('❌ [EVALUATE SPEAKING CRIT]:', e.message);
        return res.json({
            isCorrect: false, 
            status: 'retry',
            score: 0,
            feedback: "Evaluation temporary unavailable. Please try again.",
            transcription: "",
            correctText: "Error"
        });
    }

}

// ── Writing Evaluation ────────────────────────────────────────────────────────
export async function evaluateWriting(req, res, next) {
    try {
        const { questionId, imageBase64 } = req.body;
        if (!imageBase64) return res.status(400).json({ message: "Image data is required" });

        const question = await Question.findById(questionId);
        if (!question) return res.status(404).json({ message: "Question not found" });

        const expectedText = (question.correctAnswer || question.text || "").trim();
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        // Use dynamic import for Gemini API so we don't block startup if missing
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `This is a drawing made by a student learning Tamil on a digital whiteboard. 
They were asked to write the Tamil letter or word: "${expectedText}".
Does the drawing look like a legible (even if messy or written by a beginner) attempt at writing "${expectedText}"?
Respond ONLY with YES or NO.`;

        const imagePart = {
            inlineData: {
                data: cleanBase64,
                mimeType: "image/png",
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text().trim().toUpperCase();

        const isCorrect = responseText.includes("YES");

        // Persist the authoritative server result so the final lesson submit
        // evaluates this stored verification, not a client-trusted boolean.
        await recordVerifiedAttempt(req.user?.sub, question, isCorrect, isCorrect ? 100 : 0);

        return res.json({
            isCorrect,
            score: isCorrect ? 100 : 0,
            feedback: isCorrect ? "Correct!" : "Incorrect attempt. Try again."
        });

    } catch (e) {
        console.error('❌ [EVALUATE WRITING CRIT]:', e.message);
        return res.json({
            isCorrect: false,
            score: 0,
            feedback: "Evaluation temporary unavailable. Please try again."
        });
    }
}

// ── Speech Synthesis (native xAI TTS, Tamil) ──────────────────────────────────
/**
 * Generate Tamil speech via the native xAI TTS API.
 *
 * Returns the audio as a base64 MP3 data URL ({ audioUrl }) so the existing
 * HTML5 Audio players on the client work unchanged. On failure it returns a
 * Tamil error message plus `fallback: true`, letting the client gracefully fall
 * back to the browser's SpeechSynthesis so the learning flow never blocks.
 */
export async function generateSpeech(req, res, _next) {
    try {
        const { text, voice } = req.body;
        if (!text || typeof text !== 'string' || !text.trim()) {
            return res.status(400).json({ message: "Text is required" });
        }

        const speechText = text.trim();

        try {
            const audioBuffer = await synthesizeTamilSpeech(speechText, voice);
            const audioBase64 = audioBuffer.toString('base64');
            return res.json({ audioUrl: `data:audio/mpeg;base64,${audioBase64}` });
        } catch (xaiErr) {
            console.warn('[xAI TTS] synthesis failed:', xaiErr.message);
            return res.json({
                audioUrl: null,
                fallback: true,
                message: 'குரல் தற்காலிகமாகக் கிடைக்கவில்லை. சிறிது நேரத்தில் மீண்டும் முயற்சிக்கவும்.',
            });
        }
    } catch (e) {
        console.error('❌ [GENERATE SPEECH CRIT]:', e.message);
        return res.json({
            audioUrl: null,
            fallback: true,
            message: 'குரல் சேவையில் தற்காலிகச் சிக்கல் ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.',
        });
    }
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

export async function reorderQuestions(req, res, next) {
    try {
        const { orderedIds } = req.body;
        await lessonService.reorderQuestions(orderedIds);
        res.json({ message: 'Questions reordered successfully.' });
    } catch (e) { next(e); }
}

export async function createQuestion(req, res, next) {
    try {
        const question = await lessonService.createQuestion(req.params.id, req.body);
        res.status(201).json({ question });
    } catch (e) { next(e); }
}

export async function updateQuestion(req, res, next) {
    try {
        const question = await lessonService.updateQuestion(req.params.qId, req.body);
        res.json({ question });
    } catch (e) { next(e); }
}

export async function deleteQuestion(req, res, next) {
    try {
        await lessonService.deleteQuestion(req.params.qId);
        res.json({ message: 'Question deleted successfully.' });
    } catch (e) { next(e); }
}

// ── Per-question attempt energy deduction ─────────────────────────────────────
/**
 * POST /api/lessons/:id/questions/:qId/attempt
 * Deducts 1 energy per question attempt. Called by frontend before showing each question.
 */
export async function recordAttempt(req, res, next) {
    try {
        const user = await User.findById(req.user?.sub);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { canAttempt: possible, nextRecoveryIn } = canAttempt(user);
        if (!possible) {
            return res.status(403).json({ 
                error: 'NO_ENERGY', 
                message: 'No energy left. Wait for recovery or upgrade.',
                nextRecoveryIn 
            });
        }

        consumeEnergy(user);
        await user.save();

        res.json({ energy: getEnergyResponse(user) });
    } catch (e) { next(e); }
}

// ── Mistake review endpoint ───────────────────────────────────────────────────
/**
 * GET /api/lessons/mistakes
 * Returns the authenticated user's unresolved mistake questions.
 */
export async function getMistakes(req, res, next) {
    try {
        const Mistake = (await import('../models/Mistake.js')).default;
        const mistakes = await Mistake.find({ userId: req.user.sub, resolved: false })
            .sort({ lastSeen: -1 })
            .limit(50)
            .populate('questionId', 'type text options correctOptionIndex correctAnswer expectedAudioText hint explanation xp difficulty skill')
            .populate('lessonId', 'title category level');

        res.json({ mistakes });
    } catch (e) { next(e); }
}
