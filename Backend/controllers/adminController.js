import * as adminService from '../services/adminService.js';

export async function getUsers(req, res, next) {
    try {
        const users = await adminService.getAllUsers();
        res.json({ users });
    } catch (e) { next(e); }
}

export async function getTutors(req, res, next) {
    try {
        const tutors = await adminService.getAllTutors();
        res.json({ tutors });
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

export async function editUser(req, res, next) {
    try {
        const user = await adminService.editUser(req.params.id, req.body);
        res.json({ message: 'User updated successfully.', user: user.toSafeObject() });
    } catch (e) { next(e); }
}
