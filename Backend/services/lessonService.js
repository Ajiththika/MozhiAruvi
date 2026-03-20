import Lesson from '../models/Lesson.js';
import Question from '../models/Question.js';
import Progress from '../models/Progress.js';
import User from '../models/User.js';

// ── Lesons (Public/User) ──────────────────────────────────────────────────────
export async function getAllLessons() {
    return Lesson.find().sort({ moduleNumber: 1, orderIndex: 1 });
}

export async function getLessonById(lessonId) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        const err = new Error('Lesson not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    return lesson;
}

export async function getUserProgressList(userId) {
    return Progress.find({ userId });
}

// ── Questions (Public/User) ───────────────────────────────────────────────────
export async function getQuestionsForLesson(lessonId) {
    // Including correctOptionIndex to allow immediate Duolingo-style UI feedback
    return Question.find({ lessonId }).select('_id text options scoreValue correctOptionIndex');
}

// ── Submission and Progress (Phase 4 & 5) ─────────────────────────────────────
export async function evaluateAnswersAndSaveProgress(userId, lessonId, answers) {
    // 1. Validate lesson
    const lesson = await getLessonById(lessonId);

    // 2. Fetch all correct questions mapping
    const questions = await Question.find({ lessonId });
    if (!questions.length) {
        const err = new Error('No questions found for this lesson.'); err.status = 400; err.code = 'NO_QUESTIONS'; throw err;
    }

    // 3. Evaluate score
    let score = 0;
    let totalPossibleScore = 0;

    const questionMap = new Map();
    questions.forEach(q => {
        questionMap.set(q._id.toString(), q);
        totalPossibleScore += q.scoreValue;
    });

    for (const ans of answers) {
        const q = questionMap.get(ans.questionId.toString());
        if (q && q.correctOptionIndex === ans.selectedOptionIndex) {
            score += q.scoreValue;
        }
    }

    const passThreshold = totalPossibleScore * 0.7; // Example: 70% to pass
    const passed = score >= passThreshold;

    let progress = await Progress.findOne({ userId, lessonId });

    // If they haven't completed it, or they're retaking to improve score, we update.
    if (!progress) {
        progress = await Progress.create({
            userId,
            lessonId,
            score,
            isCompleted: passed,
            completedAt: passed ? new Date() : undefined
        });

        // Add credits to user if passed and this is their first time
        if (passed) {
            await User.findByIdAndUpdate(userId, { $inc: { credits: 50 } }); // Award 50 credits for passing
        }
    } else {
        // Update if the score was higher but avoid re-triggering first time events blindly
        if (score > progress.score) {
            progress.score = score;
        }
        if (!progress.isCompleted && passed) {
            progress.isCompleted = true;
            progress.completedAt = new Date();
            await User.findByIdAndUpdate(userId, { $inc: { credits: 50 } }); // First time passing!
        }
        await progress.save();
    }

    return { score, totalPossibleScore, passed, progress };
}

// ── Admin specific ────────────────────────────────────────────────────────────
export async function createLesson(data) {
    return Lesson.create(data);
}

export async function updateLesson(lessonId, updateData) {
    const lesson = await Lesson.findByIdAndUpdate(lessonId, updateData, { new: true });
    if (!lesson) {
        const err = new Error('Lesson not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    return lesson;
}

export async function deleteLesson(lessonId) {
    const lesson = await Lesson.findByIdAndDelete(lessonId);
    if (!lesson) {
        const err = new Error('Lesson not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    // Cleanup cascade
    await Question.deleteMany({ lessonId });
    await Progress.deleteMany({ lessonId });
}

export async function createQuestion(lessonId, data) {
    // ensure lesson exists
    await getLessonById(lessonId);

    return Question.create({
        ...data,
        lessonId
    });
}
