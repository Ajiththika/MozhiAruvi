import * as adminService from '../services/adminService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 6 } = req.query;
    const result = await adminService.getAllUsers(parseInt(page), parseInt(limit));
    res.json(result);
});

export const getTutors = asyncHandler(async (req, res) => {
    const { page = 1, limit = 6 } = req.query;
    const result = await adminService.getAllTutors(parseInt(page), parseInt(limit));
    res.json(result);
});

export const deactivateUser = asyncHandler(async (req, res) => {
    const user = await adminService.setUserActiveStatus(req.params.id, false);
    res.json({ message: 'User deactivated.', user: user.toSafeObject() });
});

export const activateUser = asyncHandler(async (req, res) => {
    const user = await adminService.setUserActiveStatus(req.params.id, true);
    res.json({ message: 'User activated.', user: user.toSafeObject() });
});

export const changeTutorStatus = asyncHandler(async (req, res) => {
    const status = req.body.isTutorAvailable === true;
    const user = await adminService.setTutorStatus(req.params.id, status);
    res.json({ message: `Tutor status changed to ${status}.`, user: user.toSafeObject() });
});

export const editUser = asyncHandler(async (req, res) => {
    const user = await adminService.editUser(req.params.id, req.body);
    res.json({ message: 'User updated successfully.', user: user.toSafeObject() });
});

export const getStats = asyncHandler(async (req, res) => {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
});
