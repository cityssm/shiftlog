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
  },

  'admin-notificationLogs': {
    parameterNames: [],
    sql: /* sql */ `
      select
        l.notificationLogId,
        l.notificationConfigurationId,

        n.notificationQueue,
        a.assignedToName,
        n.notificationType,
        n.notificationTypeFormJson,

        l.notificationDateTime,
        l.isSuccess,
        l.errorMessage

      from ShiftLog.NotificationLogs l
      left join ShiftLog.NotificationConfigurations n on l.notificationConfigurationId = n.notificationConfigurationId
      left join ShiftLog.AssignedTo a on n.assignedToId = a.assignedToId
              
      where n.instance = @instance
      order by l.notificationDateTime desc
    `
  }
}

export default adminReports
