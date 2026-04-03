import * as adminService from '../services/adminService.js';
import PlanSettings from '../models/PlanSettings.js';

export async function getPlanSettings(req, res, next) {
    try {
        const settings = await PlanSettings.find();
        res.json(settings);
    } catch (e) { next(e); }
}

export async function updatePlanSettings(req, res, next) {
    try {
        const { planId } = req.params;
        const updated = await PlanSettings.findOneAndUpdate({ _id: planId }, req.body, { new: true });
        res.json(updated);
    } catch (e) { next(e); }
}

export async function createPlanSettings(req, res, next) {
    try {
        const plan = await PlanSettings.create(req.body);
        res.json(plan);
    } catch (e) { next(e); }
}

export async function deletePlanSettings(req, res, next) {
    try {
        await PlanSettings.findByIdAndDelete(req.params.planId);
        res.json({ message: 'Plan deleted.' });
    } catch (e) { next(e); }
}

export async function getUsers(req, res, next) {
    try {
        const { page = 1, limit = 6 } = req.query;
        const result = await adminService.getAllUsers(parseInt(page), parseInt(limit));
        res.json(result);
    } catch (e) { next(e); }
}

export async function getTutors(req, res, next) {
    try {
        const { page = 1, limit = 6 } = req.query;
        const result = await adminService.getAllTutors(parseInt(page), parseInt(limit));
        res.json(result);
    } catch (e) { next(e); }
}

export async function deactivateUser(req, res, next) {
    try {
        const user = await adminService.setUserActiveStatus(req.params.id, false);
        res.json({ message: 'User deactivated.', user: user.toSafeObject() });
    } catch (e) { next(e); }
}

export async function activateUser(req, res, next) {
    try {
        const user = await adminService.setUserActiveStatus(req.params.id, true);
        res.json({ message: 'User activated.', user: user.toSafeObject() });
    } catch (e) { next(e); }
}

export async function changeTutorStatus(req, res, next) {

    try {
        // requires isTutorAvailable property in body or toggles it, but let's assume boolean in body
        const status = req.body.isTutorAvailable === true;
        const user = await adminService.setTutorStatus(req.params.id, status);
        res.json({ message: `Tutor status changed to ${status}.`, user: user.toSafeObject() });
    } catch (e) { next(e); }
}

export async function warnUser(req, res, next) {
    try {
        const user = await adminService.warnUser(req.params.id);
        res.json({ message: 'Warning issued to mentor.', user: user.toSafeObject() });
    } catch (e) { next(e); }
}

export async function editUser(req, res, next) {
    try {
        const user = await adminService.editUser(req.params.id, req.body);
        res.json({ message: 'User updated successfully.', user: user.toSafeObject() });
    } catch (e) { next(e); }
}

export async function getStats(req, res, next) {
    try {
        const stats = await adminService.getDashboardStats();
        res.json(stats);
    } catch (e) { next(e); }
}

export async function getPremiumUsers(req, res, next) {
    try {
        const { page = 1, limit = 10 } = req.query;
        const result = await adminService.getPremiumUsers(parseInt(page), parseInt(limit));
        res.json(result);
    } catch (e) { next(e); }
}

export async function getMentorApplications(req, res, next) {
    try {
        const applications = await adminService.getMentorApplications();
        res.json({ applications });
    } catch (e) { next(e); }
}
