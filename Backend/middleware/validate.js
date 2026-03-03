import { z } from 'zod';

const noEmpty = (field) =>
    z.string({ required_error: `${field} is required` }).trim().min(1, `${field} cannot be empty`);

export const registerSchema = z.object({
    name: noEmpty('name'),
    email: noEmpty('email').email('Invalid email'),
    password: noEmpty('password').min(8, 'Password must be at least 8 characters'),
}).strict();

export const loginSchema = z.object({
    email: noEmpty('email').email('Invalid email'),
    password: noEmpty('password'),
}).strict();

export const forgotSchema = z.object({
    email: noEmpty('email').email('Invalid email'),
}).strict();

export const resetSchema = z.object({
    token: noEmpty('token'),
    password: noEmpty('password').min(8, 'Password must be at least 8 characters'),
}).strict();

// Middleware factory
export function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const message = result.error.errors.map(e => e.message).join(', ');
            return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message } });
        }
        req.body = result.data;
        next();
    };
}
