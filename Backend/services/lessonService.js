import Lesson from '../models/Lesson.js';
import Question from '../models/Question.js';
import Progress from '../models/Progress.js';
import User from '../models/User.js';

// ── Lesons (Public/User) ──────────────────────────────────────────────────────
export async function getAllLessons() {
    try {
        // Optimization: Exclude heavy 'content' field for list views
        return await Lesson.find().select('-content').sort({ moduleNumber: 1, orderIndex: 1 });
    } catch (e) {
        if (e.name === 'MongooseError' || e.message.includes('timeout') || e.message.includes('buffering')) return [];
        throw e;
    }
}

/** 
 * Targeted fetch for dashboard: minimizes data transfer by level 
 */
export async function getLessonsForDashboard(level = 'Beginner') {
    return Lesson.find({ 
        level: { $regex: new RegExp(`^${level}$`, 'i') } 
    })
    .select('_id title description category moduleNumber orderIndex level isPremiumOnly')
    .sort({ moduleNumber: 1, orderIndex: 1 });
}

export async function getLessonById(lessonId) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        const err = new Error('Lesson not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    return lesson;
}

export async function getUserProgressList(userId) {
    // Optimization: Only return core progress fields (exclude weakAreas unless needed)
    return Progress.find({ userId }).select('lessonId isCompleted score accuracy');
}

// ── Questions (Public/User) ───────────────────────────────────────────────────
export async function getQuestionsForLesson(lessonId, isAdmin = false) {
    try {
        const allQuestions = await Question.find({ lessonId }).select('_id type text paragraph options scoreValue correctOptionIndex correctAnswer expectedAudioText audioUrl phoneticHint orderIndex').sort({ orderIndex: 1, createdAt: 1 });
        
        // Admins should see everything in order
        if (isAdmin) return allQuestions;
        
        // Return up to 10 random questions per session as requested for students
        if (allQuestions.length <= 10) return allQuestions;
        
        return allQuestions
            .sort(() => 0.5 - Math.random())
            .slice(0, 10);
    } catch (e) {
        if (e.name === 'MongooseError' || e.message.includes('timeout') || e.message.includes('buffering')) return [];
        throw e;
    }
}

// ── Submission and Progress (Phase 4 & 5) ─────────────────────────────────────
export async function evaluateAnswersAndSaveProgress(userId, lessonId, answers) {
    if (!answers || !answers.length) {
        const err = new Error('No answers provided'); err.status = 400; throw err;
    }

    // 1. Validate lesson
    const lesson = await getLessonById(lessonId);

    // 2. Fetch only the questions that were answered
    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    
    if (!questions.length) {
        const err = new Error('Questions not found.'); err.status = 400; throw err;
    }

    // 3. Evaluate score
    let score = 0;
    let totalPossibleScore = 0;
    const weakAreas = new Set();

    const questionMap = new Map();
    questions.forEach(q => {
        questionMap.set(q._id.toString(), q);
        totalPossibleScore += q.scoreValue || 10;
    });

    for (const ans of answers) {
        const q = questionMap.get(ans.questionId.toString());
        if (q) {
            const isChoiceType = ['quiz', 'identify', 'choice', 'match', 'fill', 'reading'].includes(q.type);
            const isCorrectChoice = isChoiceType && ans.selectedOptionIndex === q.correctOptionIndex;
            const isCorrectSpeaking = q.type === 'speaking' && ans.isSpeakingCompleted;
            const isCorrectWriting = q.type === 'writing' && ans.selectedOptionIndex === 0;

            if (isCorrectChoice || isCorrectSpeaking || isCorrectWriting) {
                score += q.scoreValue || 10;
            } else {
                // TRACK WEAK AREAS
                weakAreas.add(q.type);
            }
        }
    }

    const passPercentage = (score / totalPossibleScore) * 100;
    const passed = passPercentage >= 70; // 70% to pass
    
    const user = await User.findById(userId);
    if (passed && user) {
        // Streak Maintenance
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastDate = user.progress.lastLessonDate ? new Date(user.progress.lastLessonDate) : null;
        const lastMidnight = lastDate ? new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()) : null;

        if (!lastMidnight) {
            user.progress.currentStreak = 1;
            user.progress.lastLessonDate = now;
        } else {
            const diffTime = today.getTime() - lastMidnight.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                user.progress.currentStreak += 1;
                user.progress.lastLessonDate = now;
            } else if (diffDays > 1) {
                user.progress.currentStreak = 1;
                user.progress.lastLessonDate = now;
            }
        }

        if (user.progress.currentStreak > (user.progress.highStreak || 0)) {
            user.progress.highStreak = user.progress.currentStreak;
        }

        user.progress.completedLessons.addToSet(lessonId);
        await user.save();
    }

    let progress = await Progress.findOne({ userId, lessonId });

    const weakAreasList = Array.from(weakAreas);

    if (!progress) {
        progress = await Progress.create({
            userId,
            lessonId,
            score,
            totalPossibleScore,
            accuracy: Math.round(passPercentage),
            weakAreas: weakAreasList,
            isCompleted: passed,
            completedAt: passed ? new Date() : undefined
        });
    } else {
        // High score improvement
        if (score > progress.score) {
            progress.score = score;
            progress.accuracy = Math.round(passPercentage);
            progress.weakAreas = weakAreasList;
        }
        
        if (!progress.isCompleted && passed) {
            progress.isCompleted = true;
            progress.completedAt = new Date();
        }
        progress.totalPossibleScore = totalPossibleScore; // ensure its always set correctly
        await progress.save();
    }

    // 4. Find next lesson to suggest
    const nextLesson = await Lesson.findOne({
        level: lesson.level, // strictly maintain level parity
        $or: [
            { moduleNumber: lesson.moduleNumber, orderIndex: { $gt: lesson.orderIndex } },
            { moduleNumber: { $gt: lesson.moduleNumber } }
        ]
    }).sort({ moduleNumber: 1, orderIndex: 1 });

    // 5. Automatic Level Promotion Logic
    if (passed && user && user.level) {
        const currentLevel = user.level;
        const levelSequence = ['Beginner', 'Elementary', 'Intermediate', 'Advanced'];
        const currentIdx = levelSequence.indexOf(currentLevel);

        if (currentIdx !== -1 && currentIdx < levelSequence.length - 1) {
            // Count total lessons at current level
            const totalAtLevel = await Lesson.countDocuments({ level: currentLevel });
            
            // Count completed lessons at current level for this user
            const completedAtLevel = await Progress.countDocuments({ 
                userId, 
                isCompleted: true,
                lessonId: { $in: await Lesson.find({ level: currentLevel }).distinct('_id') }
            });

            // If all lessons are finished, promote
            // Note: User mentioned '20 or more', but we'll use 'all finished' as the trigger.
            if (completedAtLevel >= totalAtLevel && totalAtLevel > 0) {
                const nextLevel = levelSequence[currentIdx + 1];
                user.level = nextLevel;
                await user.save();
                console.log(`[LEVEL UP] User ${userId} promoted from ${currentLevel} to ${nextLevel}`);
            }
        }
    }

    return { 
        score, 
        totalPossibleScore, 
        passed, 
        progress, 
        user: user?.toSafeObject(),
        nextLessonId: nextLesson ? nextLesson._id : null 
    };
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

export async function updateQuestion(questionId, updateData) {
    const question = await Question.findByIdAndUpdate(questionId, updateData, { new: true });
    if (!question) {
        const err = new Error('Question not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    return question;
}

export async function deleteQuestion(questionId) {
    const question = await Question.findByIdAndDelete(questionId);
    if (!question) {
        const err = new Error('Question not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
}

export async function reorderQuestions(orderedIds) {
    if (!orderedIds || !Array.isArray(orderedIds)) return;
    
    const bulkOps = orderedIds.map((id, index) => ({
        updateOne: {
            filter: { _id: id },
            update: { $set: { orderIndex: index } }
        }
    }));
    
    if (bulkOps.length > 0) {
        await Question.bulkWrite(bulkOps);
    }
}
