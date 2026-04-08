import * as userService from '../services/userService.js';
import * as lessonService from '../services/lessonService.js';
import * as eventService from '../services/eventService.js';
import * as blogService from '../services/blogService.js';
import * as tutorService from '../services/tutorService.js';
import { getUserNotifications } from '../services/notificationService.js';

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
        const user = await userService.getUserInfo(userId);
        if (!user) throw new Error("User not found");

        const userLevel = user.level || 'Beginner';
        
        const saferFetch = async (promise, fallback = []) => {
            try { return await promise; } catch (e) { 
                console.error("Dashboard sub-fetch failed:", e.message);
                return fallback; 
            }
        };

        const [lessonsList, progress, joinRequests, blogs, questions, notifications] = await Promise.all([
            saferFetch(lessonService.getLessonsForDashboard(userLevel)),
            saferFetch(lessonService.getUserProgressList(userId)),
            saferFetch(eventService.getMyJoinRequests(userId)),
            saferFetch(blogService.getUserBlogs(userId)),
            saferFetch(tutorService.getStudentRequests(userId, 10)),
            saferFetch(getUserNotifications(userId))
        ]);

        const totalLessons = lessonsList.length;
        const completedCount = progress.filter(p => p.isCompleted).length;
        const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        const nextLesson = lessonsList.find(l => {
            const p = progress.find(pr => String(pr.lessonId) === String(l._id));
            return !p || !p.isCompleted;
        }) || (lessonsList.length > 0 ? lessonsList[0] : null);

        res.json({
            user: user.toSafeObject(),
            lessons: lessonsList,
            progress,
            joinRequests,
            blogs: blogs.slice(0, 3),
            notifications,
            questions,
            statistics: {
                totalLessons,
                completedCount,
                progressPercentage,
                nextLesson,
            }
        });
    } catch (e) { next(e); }
}
