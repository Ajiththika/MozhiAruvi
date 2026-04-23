import User from '../models/User.js';
import * as lessonService from '../services/lessonService.js';
import { canAttempt, consumeEnergy, getEnergyResponse, regenerateEnergy, validateStreak } from '../utils/energyManager.js';
import speech from '@google-cloud/speech';
import tts from '@google-cloud/text-to-speech';
import { stringSimilarity } from 'string-similarity-js';
import Question from '../models/Question.js';
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
            const isBegEq = (userLevel === 'Beginner' && lesson.level === 'Basic') || (userLevel === 'Basic' && lesson.level === 'Beginner');
            
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
            const isFullyCorrect = result.passed && (result.score >= result.totalPossibleScore);
            consumeEnergy(user, isFullyCorrect);
            await user.save();
        }

        res.json({
            message: 'Lesson submitted successfully.',
            score: result.score,
            total: result.totalPossibleScore,
            passed: result.passed,
            progress: result.progress,
            nextLessonId: result.nextLessonId,
            user: result.user || user?.toSafeObject(),
            energy: user ? getEnergyResponse(user) : null
        });
    } catch (e) { next(e); }
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

function markGoogleDisabled(service, err) {
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

function getSpeechClient() {
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

function getTtsClient() {
    try { 
        const json = getCredentialsObject();
        if (!json) return null;

        // Ensure private key handles literal newlines correctly
        const private_key = (json.private_key || '').replace(/\\n/g, '\n');

        const client = new tts.TextToSpeechClient({ 
            credentials: {
                client_email: json.client_email,
                private_key: private_key
            },
            projectId: json.project_id
        }); 

        // Log initialization once
        if (!_ttsDisabled) {
            console.log(`[Google TTS] Initialized with account: ${json.client_email}`);
        }
        return client;
    }
    catch (e) { 
        console.warn('[Google TTS] Client unavailable:', e.message); 
        logGoogleError("Google TTS Client Initialization", e);
        return null; 
    }
}

export async function evaluateSpeaking(req, res, next) {
    try {
        const { questionId, audioBase64 } = req.body;
        if (!audioBase64) return res.status(400).json({ message: "Audio data is required" });

        const question = await Question.findById(questionId);
        if (!question) return res.status(404).json({ message: "Question not found" });

        const expectedText = (question.expectedAudioText || question.text || "").trim();
        const cleanBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, '');
        
        let transcription = "";
        
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


        // ── 3. Evaluation Logic ──────────────────────────────────────────────
        const normalizedExpected = expectedText.toLowerCase().trim();
        const normalizedUser = transcription.toLowerCase().trim();

        let similarity = 0;
        if (normalizedUser === normalizedExpected && normalizedUser !== "") {
            similarity = 1.0;
        } else {
            try {
                similarity = stringSimilarity(normalizedExpected, normalizedUser);
            } catch (_simErr) {
                similarity = (normalizedUser === normalizedExpected) ? 1.0 : 0.0;
            }
        }

        const score = Math.min(100, Math.max(0, Math.round((similarity || 0) * 100)));
        const passed = score >= 50;

        return res.json({
            isCorrect: passed,
            score: score || 0,
            correctText: expectedText,
            transcription: transcription || "Unknown",
            feedback: passed ? "Correct! Well done." : "Incorrect attempt. Try again."
        });


    } catch (e) { 
        console.error('❌ [EVALUATE SPEAKING CRIT]:', e.message);
        return res.json({
            isCorrect: false, 
            score: 0,
            feedback: "Evaluation temporary unavailable. Please try again.",
            transcription: "",
            correctText: "Error"
        });
    }

}

// ── Speech Synthesis ─────────────────────────────────────────────────────────
export async function generateSpeech(req, res, _next) {
    try {
        const { text } = req.body;
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ message: "Text is required" });
        }

        const ttsClient = !_ttsDisabled ? getTtsClient() : null;
        if (ttsClient) {
            try {
                const request = {
                    input: { text },
                    voice: { languageCode: 'ta-IN', name: 'ta-IN-Standard-A' },
                    audioConfig: { audioEncoding: 'MP3' },
                };

                const [response] = await ttsClient.synthesizeSpeech(request);
                const audioBase64 = response.audioContent.toString('base64');
                return res.json({ audioUrl: `data:audio/mp3;base64,${audioBase64}` });
            } catch (googleErr) {
                markGoogleDisabled('TTS', googleErr);
                // Fall through to browser TTS fallback response below
            }
        }

        return res.json({ audioUrl: null, fallback: true, reason: 'Google TTS Service Unavailable' });
    } catch (e) { 
        console.error('❌ [GENERATE SPEECH CRIT]:', e.message);
        return res.json({ audioUrl: null, fallback: true, reason: 'Critical internal error' });
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
