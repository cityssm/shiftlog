import createApiAuditLog from '../database/api/createApiAuditLog.js';
/**
 * Logs an API request to the audit log
 * @param options - Options for logging the API request
 */
export async function logApiRequest(options) {
    const { errorMessage, isValidApiKey, request, responseStatus, userName } = options;
    const apiKey = request.params.apiKey;
    const endpoint = request.originalUrl;
    const requestMethod = request.method;
    const ipAddress = request.ip ?? request.socket.remoteAddress ?? undefined;
    const userAgent = request.get('user-agent');
    await createApiAuditLog({
        apiKey,
        endpoint,
        errorMessage,
        ipAddress,
        isValidApiKey,
        requestMethod,
        responseStatus,
        userAgent,
        userName
    });
}
