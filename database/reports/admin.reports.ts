import type { ReportDefinition } from './types.js'

export const adminReports: Record<string, ReportDefinition> = {
  'admin-apiAuditLogs': {
    parameterNames: [],
    sql: /* sql */ `
      select
        auditLogId,
        instance,
        userName,
        apiKey,
        endpoint,
        requestMethod,
        isValidApiKey,
        requestTime,
        ipAddress,
        userAgent,
        responseStatus,
        errorMessage
      from ShiftLog.ApiAuditLog
      where instance = @instance
      order by requestTime desc
    `
  }
}

export default adminReports
