export const rawExportReports = {
    // Raw Exports - Work Orders
    'admin-workOrders-raw': {
        parameterNames: [],
        sql: /* sql */ `
      SELECT
        *
      FROM
        ShiftLog.WorkOrders
      WHERE
        instance = @instance
    `
    },
    'admin-workOrderCosts-raw': {
        parameterNames: [],
        sql: /* sql */ `
      SELECT
        *
      FROM
        ShiftLog.WorkOrderCosts
      WHERE
        workOrderId IN (
          SELECT
            workOrderId
          FROM
            ShiftLog.WorkOrders
          WHERE
            instance = @instance
        )
    `
    },
    'admin-workOrderMilestones-raw': {
        parameterNames: [],
        sql: /* sql */ `
      SELECT
        *
      FROM
        ShiftLog.WorkOrderMilestones
      WHERE
        workOrderId IN (
          SELECT
            workOrderId
          FROM
            ShiftLog.WorkOrders
          WHERE
            instance = @instance
        )
    `
    },
    'admin-workOrderNotes-raw': {
        parameterNames: [],
        sql: /* sql */ `
      SELECT
        *
      FROM
        ShiftLog.WorkOrderNotes
      WHERE
        workOrderId IN (
          SELECT
            workOrderId
          FROM
            ShiftLog.WorkOrders
          WHERE
            instance = @instance
        )
    `
    },
    'admin-workOrderTags-raw': {
        parameterNames: [],
        sql: /* sql */ `
      SELECT
        *
      FROM
        ShiftLog.WorkOrderTags
      WHERE
        workOrderId IN (
          SELECT
            workOrderId
          FROM
            ShiftLog.WorkOrders
          WHERE
            instance = @instance
        )
    `
    },
    // Raw Exports - Shifts
    'admin-shifts-raw': {
        parameterNames: [],
        sql: /* sql */ `
      SELECT
        *
      FROM
        ShiftLog.Shifts
      WHERE
        instance = @instance
    `
    },
    // Raw Exports - Timesheets
    'admin-timesheets-raw': {
        parameterNames: [],
        sql: /* sql */ `
      SELECT
        *
      FROM
        ShiftLog.Timesheets
      WHERE
        instance = @instance
    `
    }
};
export const adminReports = {
    ...rawExportReports,
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
    'admin-locations': {
        parameterNames: [],
        sql: /* sql */ `
      SELECT
        locationId,
        address1,
        address2,
        cityProvince,
        latitude,
        longitude,
        recordSync_isSynced
      FROM
        ShiftLog.Locations
      WHERE
        instance = @instance
        AND recordDelete_dateTime IS NULL
      ORDER BY
        address1
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
