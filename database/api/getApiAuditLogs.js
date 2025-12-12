import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getApiAuditLogs(filters = {}) {
    const pool = await getShiftLogConnectionPool();
    const limit = filters.limit ?? 100;
    const offset = filters.offset ?? 0;
    let whereClause = 'where instance = @instance';
    if (filters.userName !== undefined) {
        whereClause += ' and userName = @userName';
    }
    if (filters.isValidApiKey !== undefined) {
        whereClause += ' and isValidApiKey = @isValidApiKey';
    }
    if (filters.startDate !== undefined) {
        whereClause += ' and requestTime >= @startDate';
    }
    if (filters.endDate !== undefined) {
        whereClause += ' and requestTime <= @endDate';
    }
    const sql = /* sql */ `
    select top (@limit)
      auditLogId, userName, apiKey, endpoint, requestMethod, isValidApiKey,
      requestTime, ipAddress, userAgent, responseStatus, errorMessage
    from ShiftLog.ApiAuditLog
    ${whereClause}
    order by requestTime desc
    offset @offset rows
  `;
    const request = pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('limit', limit)
        .input('offset', offset);
    if (filters.userName !== undefined) {
        request.input('userName', filters.userName);
    }
    if (filters.isValidApiKey !== undefined) {
        request.input('isValidApiKey', filters.isValidApiKey);
    }
    if (filters.startDate !== undefined) {
        request.input('startDate', filters.startDate);
    }
    if (filters.endDate !== undefined) {
        request.input('endDate', filters.endDate);
    }
    const result = await request.query(sql);
    return result.recordset;
}
