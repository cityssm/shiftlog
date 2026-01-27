export const adminReports = {
    'admin-apiAuditLogs': {
        parameterNames: [],
        sql: /* sql */ `
      SELECT
        auditLogId,
        instance,
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
        ShiftLog.ApiAuditLog
      WHERE
        instance = @instance
      ORDER BY
        requestTime DESC
    `
    },
    'admin-notificationLogs': {
        parameterNames: [],
        sql: /* sql */ `
      SELECT
        l.notificationLogId,
        l.notificationConfigurationId,
        n.notificationQueue,
        a.assignedToName,
        n.notificationType,
        n.notificationTypeFormJson,
        l.notificationDateTime,
        l.isSuccess,
        l.errorMessage
      FROM
        ShiftLog.NotificationLogs l
        LEFT JOIN ShiftLog.NotificationConfigurations n ON l.notificationConfigurationId = n.notificationConfigurationId
        LEFT JOIN ShiftLog.AssignedTo a ON n.assignedToId = a.assignedToId
      WHERE
        n.instance = @instance
      ORDER BY
        l.notificationDateTime DESC
    `
    }
};
export default adminReports;
