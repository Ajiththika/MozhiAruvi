import * as userService from '../services/userService.js';
import * as lessonService from '../services/lessonService.js';
import * as eventService from '../services/eventService.js';
import * as blogService from '../services/blogService.js';
import * as tutorService from '../services/tutorService.js';

export async function getProfile(req, res, next) {
    try {
        const user = await userService.getUserInfo(req.user.sub);
        res.json({ user: user.toSafeObject() });
    } catch (e) { next(e); }
}

export async function updateProfile(req, res, next) {
    try {
        if (req.file) {
            req.body.profilePhoto = req.file.path;
        }
        const user = await userService.updateUserInfo(req.user.sub, req.body);
        res.json({ message: 'Profile updated successfully', user: user.toSafeObject() });
    } catch (e) { next(e); }
}

export async function updatePassword(req, res, next) {
    try {
        await userService.changeUserPassword(req.user.sub, req.body.currentPassword, req.body.newPassword);
        res.json({ message: 'Password updated successfully. Please log in again.' });
    } catch (e) { next(e); }
}

export async function deactivateAccount(req, res, next) {
    try {
        await userService.deactivateUserAccount(req.user.sub);
        res.clearCookie('rt');
        res.json({ message: 'Account deactivated successfully. You have been logged out.' });
    } catch (e) { next(e); }
}

export async function setLevel(req, res, next) {
    try {
        const user = await userService.setUserLevel(req.user.sub, req.body.level);
        res.json({ message: 'Level updated', user: user.toSafeObject() });
    } catch (e) { next(e); }
}

export async function completeOnboarding(req, res, next) {
    try {
        const user = await userService.completeOnboarding(req.user.sub, req.body);
        res.json({ message: 'Onboarding completed', user: user.toSafeObject() });
    } catch (e) { next(e); }
}

export async function consumeCredit(req, res, next) {
    try {
        const user = await userService.consumeCredit(req.user.sub);
        res.json({ message: 'Credit consumed', learningCredits: user.learningCredits });
    } catch (e) { next(e); }
}

export async function getStudentDashboardData(req, res, next) {
    try {
        const userId = req.user.sub;
        const [user, lessonsData, progress, joinRequests, blogs, questions] = await Promise.all([
            userService.getUserInfo(userId),
            lessonService.getAllLessons(),
            lessonService.getUserProgressList(userId),
            eventService.getMyJoinRequests(userId),
            blogService.getUserBlogs(userId),
            tutorService.getStudentRequests(userId)
        ]);
        const lessonsList = Array.isArray(lessonsData) ? lessonsData : (lessonsData.lessons || []);
        
        // Backend-driven metric computation
        const totalLessons = lessonsList.length;
        const completedCount = progress.filter(p => p.isCompleted).length;
        const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
        
        const nextLesson = lessonsList.find(l => {
            const p = progress.find(pr => String(pr.lessonId) === String(l._id));
            return !p || !p.isCompleted;
        }) || (totalLessons > 0 ? lessonsList[0] : null);

        res.json({
            user: user.toSafeObject(),
            lessons: lessonsList,
            progress,
            joinRequests,
            blogs,
            questions: questions.slice(0, 5),
            statistics: {
                totalLessons,
                completedCount,
                progressPercentage,
                nextLesson,
            }
        });
    } catch (e) { next(e); }
}
