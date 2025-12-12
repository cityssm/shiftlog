import getApiAuditLogs from '../../database/api/getApiAuditLogs.js';
export default async function handler(request, response) {
    const result = await getApiAuditLogs(request.body);
    response.json({
        logs: result.logs,
        success: true,
        totalCount: result.totalCount
    });
}
