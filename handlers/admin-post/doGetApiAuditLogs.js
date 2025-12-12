import getApiAuditLogs from '../../database/api/getApiAuditLogs.js';
export default async function handler(request, response) {
    const logs = await getApiAuditLogs(request.body);
    response.json({
        success: true,
        logs
    });
}
