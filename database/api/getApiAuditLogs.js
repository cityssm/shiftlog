import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getApiAuditLogs(filters = {}) {
    const pool = await getShiftLogConnectionPool();
    const defaultLimit = 100;
    const limit = filters.limit ?? defaultLimit;
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
    // Get total count
    const countSql = /* sql */ `
    SELECT
      count(*) AS totalCount
    FROM
      ShiftLog.ApiAuditLog ${whereClause}
  `;
    const countRequest = pool
        .request()
        .input('instance', getConfigProperty('application.instance'));
    if (filters.userName !== undefined) {
        countRequest.input('userName', filters.userName);
    }
    if (filters.isValidApiKey !== undefined) {
        countRequest.input('isValidApiKey', filters.isValidApiKey);
    }
    if (filters.startDate !== undefined) {
        countRequest.input('startDate', filters.startDate);
    }
    if (filters.endDate !== undefined) {
        countRequest.input('endDate', filters.endDate);
    }
    const countResult = await countRequest.query(countSql);
    const totalCount = countResult.recordset[0]?.totalCount ?? 0;
    // Get paginated data
    const sql = /* sql */ `
    SELECT
      auditLogId,
      userName,
      apiKey,
      [endpoint],
      requestMethod,
      isValidApiKey,
      requestTime,
      ipAddress,
      userAgent,
      responseStatus,
      errorMessage
    FROM
      ShiftLog.ApiAuditLog ${whereClause}
    ORDER BY
      requestTime DESC
    OFFSET
      @offset rows
    FETCH NEXT
      @limit rows only
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
    return {
        logs: result.recordset,
        totalCount
    };
}
