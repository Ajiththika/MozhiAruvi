import * as userService from '../services/userService.js';
import * as lessonService from '../services/lessonService.js';
import * as eventService from '../services/eventService.js';
import * as blogService from '../services/blogService.js';
import * as tutorService from '../services/tutorService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
    const user = await userService.getUserInfo(req.user.sub);
    res.json({ user: user.toSafeObject() });
});

export const updateProfile = asyncHandler(async (req, res) => {
    if (req.file) {
        req.body.profilePhoto = req.file.path;
    }
    const user = await userService.updateUserInfo(req.user.sub, req.body);
    res.json({ message: 'Profile updated successfully', user: user.toSafeObject() });
});

export const updatePassword = asyncHandler(async (req, res) => {
    await userService.changeUserPassword(req.user.sub, req.body.currentPassword, req.body.newPassword);
    res.json({ message: 'Password updated successfully. Please log in again.' });
});

export const deactivateAccount = asyncHandler(async (req, res) => {
    await userService.deactivateUserAccount(req.user.sub);
    res.clearCookie('rt');
    res.json({ message: 'Account deactivated successfully. You have been logged out.' });
});

export const setLevel = asyncHandler(async (req, res) => {
    const user = await userService.setUserLevel(req.user.sub, req.body.level);
    res.json({ message: 'Level updated', user: user.toSafeObject() });
});

export const consumeCredit = asyncHandler(async (req, res) => {
    const user = await userService.consumeCredit(req.user.sub);
    res.json({ message: 'Credit consumed', learningCredits: user.learningCredits });
});

export const getStudentDashboardData = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const [user, lessonsData, progress, joinRequests, blogs, questions] = await Promise.all([
        userService.getUserInfo(userId),
        lessonService.getAllLessons(),
        lessonService.getUserProgressList(userId),
        eventService.getMyJoinRequests(userId),
        blogService.getUserBlogs(userId),
        tutorService.getStudentRequests(userId)
    ]);
    res.json({
        user: user.toSafeObject(),
        lessons: Array.isArray(lessonsData) ? lessonsData : (lessonsData.lessons || []),
        progress,
        joinRequests,
        blogs,
        questions: questions.slice(0, 5)
    });
});
