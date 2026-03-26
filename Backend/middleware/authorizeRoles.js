/**
 * authorizeRoles.js — Production-level RBAC middleware
 */

export function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        // Authenticate middleware must run before this to populate req.user
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const userRole = req.user.role;

        if (!allowedRoles.includes(userRole)) {
            // Logging the unauthorized attempt
            console.warn(`[RBAC] Access denied: Role '${userRole}' attempted to access ${req.method} ${req.originalUrl}. Required: [${allowedRoles.join(', ')}]`);

            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action',
                role_required: allowedRoles,
                your_role: userRole
            });
        }

        next();
    };
}
