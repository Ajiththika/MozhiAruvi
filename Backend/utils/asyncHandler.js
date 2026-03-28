/**
 * asyncHandler.js
 *
 * A simple wrapper to eliminate try-catch boilerplate in Express controllers.
 */

export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
