export function responseWrapper(req, res, next) {
    const originalJson = res.json;

    res.json = function (body) {
        // If the response is already formatted as { success: ..., data: ... } or contains an error,
        // or we are bypassing wrapping (e.g. certain webhooks), return as is.
        if (
            body &&
            (body.success !== undefined || body.error !== undefined)
        ) {
            return originalJson.call(this, body);
        }

        // Wrap only non-error responses
        if (res.statusCode >= 400) {
            return originalJson.call(this, body);
        }

        // Unified success wrapper
        return originalJson.call(this, {
            success: true,
            data: body,
        });
    };

    next();
}
