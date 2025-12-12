// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-await-in-loop */

import { unlink } from 'node:fs/promises'

import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getCachedSettingValue } from '../../helpers/cache/settings.cache.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:database:cleanup`)

interface DeletedAttachment {
  workOrderAttachmentId: number
  fileSystemPath: string
  recordDelete_dateTime: Date
}

/**
 * Permanently deletes records that have been marked as deleted for a minimum number of days
 * and have no foreign key relationships to active records.
 * @returns An object containing the success status, count of deleted records, and any errors encountered.
 */
export default async function permanentlyDeleteRecords(): Promise<{
  success: boolean
  deletedCount: number
  errors: string[]
}> {
  const errors: string[] = []
  let deletedCount = 0

  try {
    const pool = await getShiftLogConnectionPool()

    // Get the minimum days before permanent delete setting
    const daysBeforeDeleteString = await getCachedSettingValue(
      'cleanup.daysBeforePermanentDelete'
    )
    const daysBeforeDelete = Math.max(
      1,
      Number.parseInt(daysBeforeDeleteString || '60', 10) || 60
    )

    debug(
      `Starting cleanup task with ${daysBeforeDelete} days before permanent delete`
    )

    // Calculate the cutoff date
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysBeforeDelete)

    // Get API audit log retention days setting
    const apiAuditLogRetentionDaysString = await getCachedSettingValue(
      'cleanup.apiAuditLogRetentionDays'
    )
    const apiAuditLogRetentionDays = Number.parseInt(
      apiAuditLogRetentionDaysString || '365',
      10
    ) || 365

    debug(
      `API audit log retention period: ${apiAuditLogRetentionDays} days`
    )

    // Clean up old API audit logs if retention is enabled (> 0)
    if (apiAuditLogRetentionDays > 0) {
      const apiAuditCutoffDate = new Date()
      apiAuditCutoffDate.setDate(
        apiAuditCutoffDate.getDate() - apiAuditLogRetentionDays
      )

      const apiAuditLogsResult = await pool
        .request()
        .input('apiAuditCutoffDate', apiAuditCutoffDate).query(/* sql */ `
          DELETE FROM ShiftLog.ApiAuditLog
          WHERE requestTime < @apiAuditCutoffDate
        `)

      if (apiAuditLogsResult.rowsAffected[0] > 0) {
        deletedCount += apiAuditLogsResult.rowsAffected[0]
        debug(
          `Permanently deleted ${apiAuditLogsResult.rowsAffected[0]} API audit log records older than ${apiAuditLogRetentionDays} days`
        )
      }
    } else {
      debug('API audit log cleanup is disabled (retention days set to 0)')
    }

    // Step 1: Handle WorkOrderAttachments - delete files first, then records
    const attachmentsResult = await pool
      .request()
      .input('cutoffDate', cutoffDate).query<DeletedAttachment>(/* sql */ `
        SELECT workOrderAttachmentId, fileSystemPath, recordDelete_dateTime
        FROM ShiftLog.WorkOrderAttachments
        WHERE recordDelete_dateTime IS NOT NULL
          AND recordDelete_dateTime < @cutoffDate
      `)

    for (const attachment of attachmentsResult.recordset) {
      try {
        // Delete the file from the filesystem
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await unlink(attachment.fileSystemPath)

        debug(
          `Deleted file: ${attachment.fileSystemPath} for attachment ${attachment.workOrderAttachmentId}`
        )
      } catch (error) {
        // Log error but continue - the file might already be deleted
        const errorMessage = `Failed to delete file ${attachment.fileSystemPath}: ${error instanceof Error ? error.message : String(error)}`
        debug(errorMessage)
        errors.push(errorMessage)
      }

      // Delete the database record
      try {
        await pool
          .request()
          .input('workOrderAttachmentId', attachment.workOrderAttachmentId)
          .query(/* sql */ `
            DELETE FROM ShiftLog.WorkOrderAttachments
            WHERE workOrderAttachmentId = @workOrderAttachmentId
          `)

        deletedCount += 1

        debug(
          `Permanently deleted attachment record: ${attachment.workOrderAttachmentId}`
        )
      } catch (error) {
        const errorMessage = `Failed to delete attachment record ${attachment.workOrderAttachmentId}: ${error instanceof Error ? error.message : String(error)}`
        debug(errorMessage)
        errors.push(errorMessage)
      }
    }

    // Step 2: Clean up child records of WorkOrders
    // WorkOrderTags - no foreign keys to check
    const tagsResult = await pool.request().input('cutoffDate', cutoffDate)
      .query(/* sql */ `
        DELETE FROM ShiftLog.WorkOrderTags
        WHERE workOrderId in (
          SELECT workOrderId FROM ShiftLog.WorkOrders
          WHERE recordDelete_dateTime IS NOT NULL
            AND recordDelete_dateTime < @cutoffDate
        )
      `)

    if (tagsResult.rowsAffected[0] > 0) {
      deletedCount += tagsResult.rowsAffected[0]
      debug(
        `Permanently deleted ${tagsResult.rowsAffected[0]} WorkOrderTags records`
      )
    }

    // WorkOrderNotes - no foreign keys to check
    const notesResult = await pool.request().input('cutoffDate', cutoffDate)
      .query(/* sql */ `
        DELETE FROM ShiftLog.WorkOrderNotes
        WHERE recordDelete_dateTime IS NOT NULL
          AND recordDelete_dateTime < @cutoffDate
      `)

    if (notesResult.rowsAffected[0] > 0) {
      deletedCount += notesResult.rowsAffected[0]
      debug(
        `Permanently deleted ${notesResult.rowsAffected[0]} WorkOrderNotes records`
      )
    }

    // WorkOrderMilestones - no foreign keys to check
    const milestonesResult = await pool
      .request()
      .input('cutoffDate', cutoffDate).query(/* sql */ `
        DELETE FROM ShiftLog.WorkOrderMilestones
        WHERE recordDelete_dateTime IS NOT NULL
          AND recordDelete_dateTime < @cutoffDate
      `)

    if (milestonesResult.rowsAffected[0] > 0) {
      deletedCount += milestonesResult.rowsAffected[0]
      debug(
        `Permanently deleted ${milestonesResult.rowsAffected[0]} WorkOrderMilestones records`
      )
    }

    // WorkOrderCosts - no foreign keys to check
    const costsResult = await pool
      .request()
      .input('cutoffDate', cutoffDate).query(/* sql */ `
        DELETE FROM ShiftLog.WorkOrderCosts
        WHERE recordDelete_dateTime IS NOT NULL
          AND recordDelete_dateTime < @cutoffDate
      `)

    if (costsResult.rowsAffected[0] > 0) {
      deletedCount += costsResult.rowsAffected[0]
      debug(
        `Permanently deleted ${costsResult.rowsAffected[0]} WorkOrderCosts records`
      )
    }

    // Step 3: Clean up WorkOrders that have no active child records
    const workOrdersResult = await pool
      .request()
      // eslint-disable-next-line no-secrets/no-secrets
      .input('cutoffDate', cutoffDate).query(/* sql */ `
        DELETE wo
        FROM ShiftLog.WorkOrders wo
        WHERE wo.recordDelete_dateTime IS NOT NULL
          AND wo.recordDelete_dateTime < @cutoffDate
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.WorkOrderTags wt
            WHERE wt.workOrderId = wo.workOrderId
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.WorkOrderNotes wn
            WHERE wn.workOrderId = wo.workOrderId
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.WorkOrderMilestones wm
            WHERE wm.workOrderId = wo.workOrderId
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.WorkOrderAttachments wa
            WHERE wa.workOrderId = wo.workOrderId
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.WorkOrderCosts wc
            WHERE wc.workOrderId = wo.workOrderId
          )
      `)
    if (workOrdersResult.rowsAffected[0] > 0) {
      deletedCount += workOrdersResult.rowsAffected[0]
      debug(
        `Permanently deleted ${workOrdersResult.rowsAffected[0]} WorkOrders records`
      )
    }

    // Step 4: Clean up other tables with no foreign key dependencies
    // Locations - no foreign key references from other tables
    const locationsResult = await pool.request().input('cutoffDate', cutoffDate)
      .query(/* sql */ `
        DELETE l
        FROM ShiftLog.Locations l
        WHERE l.recordDelete_dateTime IS NOT NULL
          AND l.recordDelete_dateTime < @cutoffDate
      `)
    if (locationsResult.rowsAffected[0] > 0) {
      deletedCount += locationsResult.rowsAffected[0]
      debug(
        `Permanently deleted ${locationsResult.rowsAffected[0]} Locations records`
      )
    }

    // WorkOrderTypes - check for references from active WorkOrders
    const workOrderTypesResult = await pool
      .request()
      .input('cutoffDate', cutoffDate).query(/* sql */ `
        DELETE wot
        FROM ShiftLog.WorkOrderTypes wot
        WHERE wot.recordDelete_dateTime IS NOT NULL
          AND wot.recordDelete_dateTime < @cutoffDate
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.WorkOrders wo
            WHERE wo.workOrderTypeId = wot.workOrderTypeId
          )
      `)
    if (workOrderTypesResult.rowsAffected[0] > 0) {
      deletedCount += workOrderTypesResult.rowsAffected[0]
      debug(
        `Permanently deleted ${workOrderTypesResult.rowsAffected[0]} WorkOrderTypes records`
      )
    }

    // DataListItems - check for references from active records
    const dataListItemsResult = await pool
      .request()
      .input('cutoffDate', cutoffDate).query(/* sql */ `
        DELETE dli
        FROM ShiftLog.DataListItems dli
        WHERE dli.recordDelete_dateTime IS NOT NULL
          AND dli.recordDelete_dateTime < @cutoffDate
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.WorkOrders wo
            WHERE (wo.workOrderStatusDataListItemId = dli.dataListItemId
              OR wo.assignedToDataListItemId = dli.dataListItemId)
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.WorkOrderMilestones wm
            WHERE wm.assignedToDataListItemId = dli.dataListItemId
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.Equipment e
            WHERE e.equipmentTypeDataListItemId = dli.dataListItemId
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.Shifts s
            WHERE (s.shiftTimeDataListItemId = dli.dataListItemId
              OR s.shiftTypeDataListItemId = dli.dataListItemId)
          )
      `)
    if (dataListItemsResult.rowsAffected[0] > 0) {
      deletedCount += dataListItemsResult.rowsAffected[0]
      debug(
        `Permanently deleted ${dataListItemsResult.rowsAffected[0]} DataListItems records`
      )
    }

    // DataLists - check for references from active DataListItems
    const dataListsResult = await pool.request().input('cutoffDate', cutoffDate)
      .query(/* sql */ `
        DELETE dl
        FROM ShiftLog.DataLists dl
        WHERE dl.recordDelete_dateTime IS NOT NULL
          AND dl.recordDelete_dateTime < @cutoffDate
          and dl.isSystemList = 0
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.DataListItems dli
            WHERE dli.instance = dl.instance
              AND dli.dataListKey = dl.dataListKey
          )
      `)
    if (dataListsResult.rowsAffected[0] > 0) {
      deletedCount += dataListsResult.rowsAffected[0]
      debug(
        `Permanently deleted ${dataListsResult.rowsAffected[0]} DataLists records`
      )
    }

    // Crews - check for references from active records
    const crewsResult = await pool.request().input('cutoffDate', cutoffDate)
      .query(/* sql */ `
        DELETE c
        FROM ShiftLog.Crews c
        WHERE c.recordDelete_dateTime IS NOT NULL
          AND c.recordDelete_dateTime < @cutoffDate
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.CrewMembers cm
            WHERE cm.crewId = c.crewId
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.ShiftCrews sc
            WHERE sc.crewId = c.crewId
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.ShiftEmployees se
            WHERE se.crewId = c.crewId
          )
      `)
    if (crewsResult.rowsAffected[0] > 0) {
      deletedCount += crewsResult.rowsAffected[0]
      debug(`Permanently deleted ${crewsResult.rowsAffected[0]} Crews records`)
    }

    // Employees - check for references from active records
    const employeesResult = await pool.request().input('cutoffDate', cutoffDate)
      .query(/* sql */ `
        DELETE e
        FROM ShiftLog.Employees e
        WHERE e.recordDelete_dateTime IS NOT NULL
          AND e.recordDelete_dateTime < @cutoffDate
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.CrewMembers cm
            WHERE cm.instance = e.instance
              AND cm.employeeNumber = e.employeeNumber
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.Shifts s
            WHERE s.instance = e.instance
              AND s.supervisorEmployeeNumber = e.employeeNumber
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.ShiftEmployees se
            WHERE se.instance = e.instance
              AND se.employeeNumber = e.employeeNumber
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.ShiftEquipment seq
            WHERE seq.instance = e.instance
              AND seq.employeeNumber = e.employeeNumber
          )
      `)
    if (employeesResult.rowsAffected[0] > 0) {
      deletedCount += employeesResult.rowsAffected[0]
      debug(
        `Permanently deleted ${employeesResult.rowsAffected[0]} Employees records`
      )
    }

    // Equipment - check for references from active records
    const equipmentResult = await pool.request().input('cutoffDate', cutoffDate)
      .query(/* sql */ `
        DELETE eq
        FROM ShiftLog.Equipment eq
        WHERE eq.recordDelete_dateTime IS NOT NULL
          AND eq.recordDelete_dateTime < @cutoffDate
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.ShiftEquipment se
            WHERE se.instance = eq.instance
              AND se.equipmentNumber = eq.equipmentNumber
          )
      `)
    if (equipmentResult.rowsAffected[0] > 0) {
      deletedCount += equipmentResult.rowsAffected[0]
      debug(
        `Permanently deleted ${equipmentResult.rowsAffected[0]} Equipment records`
      )
    }

    // Shifts - check for references from active child records
    const shiftsResult = await pool.request().input('cutoffDate', cutoffDate)
      .query(/* sql */ `
        DELETE s
        FROM ShiftLog.Shifts s
        WHERE s.recordDelete_dateTime IS NOT NULL
          AND s.recordDelete_dateTime < @cutoffDate
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.ShiftCrews sc
            WHERE sc.shiftId = s.shiftId
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.ShiftEmployees se
            WHERE se.shiftId = s.shiftId
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.ShiftEquipment seq
            WHERE seq.shiftId = s.shiftId
          )
      `)
    if (shiftsResult.rowsAffected[0] > 0) {
      deletedCount += shiftsResult.rowsAffected[0]
      debug(
        `Permanently deleted ${shiftsResult.rowsAffected[0]} Shifts records`
      )
    }

    // Timesheets - check for references from active child records
    const timesheetsResult = await pool
      .request()
      .input('cutoffDate', cutoffDate).query(/* sql */ `
        DELETE t
        FROM ShiftLog.Timesheets t
        WHERE t.recordDelete_dateTime IS NOT NULL
          AND t.recordDelete_dateTime < @cutoffDate
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.TimesheetColumns tc
            WHERE tc.timesheetId = t.timesheetId
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.TimesheetRows tr
            WHERE tr.timesheetId = t.timesheetId
          )
      `)
    if (timesheetsResult.rowsAffected[0] > 0) {
      deletedCount += timesheetsResult.rowsAffected[0]
      debug(
        `Permanently deleted ${timesheetsResult.rowsAffected[0]} Timesheets records`
      )
    }

    // UserGroups - check for references from active records
    const userGroupsResult = await pool
      .request()
      .input('cutoffDate', cutoffDate).query(/* sql */ `
        DELETE ug
        FROM ShiftLog.UserGroups ug
        WHERE ug.recordDelete_dateTime IS NOT NULL
          AND ug.recordDelete_dateTime < @cutoffDate
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.UserGroupMembers ugm
            WHERE ugm.userGroupId = ug.userGroupId
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.DataListItems dli
            WHERE dli.userGroupId = ug.userGroupId
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.Employees e
            WHERE e.userGroupId = ug.userGroupId
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.Equipment eq
            WHERE eq.userGroupId = ug.userGroupId
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.Locations l
            WHERE l.userGroupId = ug.userGroupId
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.WorkOrderTypes wot
            WHERE wot.userGroupId = ug.userGroupId
          )
      `)
    if (userGroupsResult.rowsAffected[0] > 0) {
      deletedCount += userGroupsResult.rowsAffected[0]
      debug(
        `Permanently deleted ${userGroupsResult.rowsAffected[0]} UserGroups records`
      )
    }

    // Users - only delete if they have no related records
    const usersResult = await pool.request().input('cutoffDate', cutoffDate)
      .query(/* sql */ `
        DELETE u
        FROM ShiftLog.Users u
        WHERE u.recordDelete_dateTime IS NOT NULL
          AND u.recordDelete_dateTime < @cutoffDate
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.UserSettings us
            WHERE us.instance = u.instance
              AND us.userName = u.userName
          )
          AND NOT EXISTS (
            SELECT 1 FROM ShiftLog.UserGroupMembers ugm
            WHERE ugm.instance = u.instance
              AND ugm.userName = u.userName
          )
      `)
    if (usersResult.rowsAffected[0] > 0) {
      deletedCount += usersResult.rowsAffected[0]
      debug(`Permanently deleted ${usersResult.rowsAffected[0]} Users records`)
    }

    debug(`Cleanup task completed. Total records deleted: ${deletedCount}`)

    return {
      success: true,

      deletedCount,
      errors
    }
  } catch (error) {
    const errorMessage = `Cleanup task failed: ${error instanceof Error ? error.message : String(error)}`
    debug(errorMessage)
    errors.push(errorMessage)

    return {
      success: false,

      deletedCount,
      errors
    }
  }
}
