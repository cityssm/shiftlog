import { unlink } from 'node:fs/promises';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getCachedSettingValue } from '../../helpers/cache/settings.cache.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:database:cleanup`);
const instance = getConfigProperty('application.instance');
export const deleteUserName = 'system.databaseCleanup';
export default async function permanentlyDeleteRecords() {
    const errors = [];
    let deletedCount = 0;
    try {
        const pool = await getShiftLogConnectionPool();
        const daysBeforeDeleteString = await getCachedSettingValue('cleanup.daysBeforePermanentDelete');
        const daysBeforeDelete = Math.max(1, Number.parseInt(daysBeforeDeleteString || '60', 10) || 60);
        debug(`Starting cleanup task with ${daysBeforeDelete} days before permanent delete`);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBeforeDelete);
        const apiAuditLogRetentionDaysString = await getCachedSettingValue('cleanup.apiAuditLogRetentionDays');
        const apiAuditLogRetentionDays = Number.parseInt(apiAuditLogRetentionDaysString || '365', 10) || 365;
        debug(`API audit log retention period: ${apiAuditLogRetentionDays} days`);
        if (apiAuditLogRetentionDays > 0) {
            const apiAuditCutoffDate = new Date();
            apiAuditCutoffDate.setDate(apiAuditCutoffDate.getDate() - apiAuditLogRetentionDays);
            const apiAuditLogsResult = await pool
                .request()
                .input('apiAuditCutoffDate', apiAuditCutoffDate)
                .query(`
          DELETE FROM ShiftLog.ApiAuditLog
          WHERE
            requestTime < @apiAuditCutoffDate
        `);
            if (apiAuditLogsResult.rowsAffected[0] > 0) {
                deletedCount += apiAuditLogsResult.rowsAffected[0];
                debug(`Permanently deleted ${apiAuditLogsResult.rowsAffected[0]} API audit log records older than ${apiAuditLogRetentionDays} days`);
            }
        }
        else {
            debug('API audit log cleanup is disabled (retention days set to 0)');
        }
        debug('Starting cleanup of WorkOrderAttachments');
        const attachmentsResult = await pool
            .request()
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        SELECT
          workOrderAttachmentId,
          fileSystemPath,
          recordDelete_dateTime
        FROM
          ShiftLog.WorkOrderAttachments
        WHERE
          recordDelete_dateTime IS NOT NULL
          AND recordDelete_dateTime < @cutoffDate
          AND workOrderId IN (
            SELECT
              workOrderId
            FROM
              ShiftLog.WorkOrders
            WHERE
              instance = @instance
          )
      `);
        for (const attachment of attachmentsResult.recordset) {
            try {
                await unlink(attachment.fileSystemPath);
                debug(`Deleted file: ${attachment.fileSystemPath} for attachment ${attachment.workOrderAttachmentId}`);
            }
            catch (error) {
                const errorMessage = `Failed to delete file ${attachment.fileSystemPath}: ${error instanceof Error ? error.message : String(error)}`;
                debug(errorMessage);
                errors.push(errorMessage);
            }
            try {
                await pool
                    .request()
                    .input('workOrderAttachmentId', attachment.workOrderAttachmentId)
                    .query(`
            DELETE FROM ShiftLog.WorkOrderAttachments
            WHERE
              workOrderAttachmentId = @workOrderAttachmentId
          `);
                deletedCount += 1;
                debug(`Permanently deleted attachment record: ${attachment.workOrderAttachmentId}`);
            }
            catch (error) {
                const errorMessage = `Failed to delete attachment record ${attachment.workOrderAttachmentId}: ${error instanceof Error ? error.message : String(error)}`;
                debug(errorMessage);
                errors.push(errorMessage);
            }
        }
        await pool
            .request()
            .input('deleteUserName', deleteUserName)
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        UPDATE ShiftLog.WorkOrderAttachments
        SET
          recordDelete_userName = @deleteUserName,
          recordDelete_dateTime = GETDATE()
        WHERE
          recordDelete_dateTime IS NULL
          AND workOrderId IN (
            SELECT
              workOrderId
            FROM
              ShiftLog.WorkOrders
            WHERE
              recordDelete_dateTime IS NOT NULL
              AND recordDelete_dateTime < @cutoffDate
              AND instance = @instance
          )
      `);
        debug('Completed cleanup of WorkOrderAttachments');
        debug('Starting cleanup of WorkOrderTags');
        const tagsResult = await pool
            .request()
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        DELETE FROM ShiftLog.WorkOrderTags
        WHERE
          workOrderId IN (
            SELECT
              workOrderId
            FROM
              ShiftLog.WorkOrders
            WHERE
              recordDelete_dateTime IS NOT NULL
              AND recordDelete_dateTime < @cutoffDate
              AND instance = @instance
          )
      `);
        if (tagsResult.rowsAffected[0] > 0) {
            deletedCount += tagsResult.rowsAffected[0];
            debug(`Permanently deleted ${tagsResult.rowsAffected[0]} WorkOrderTags records`);
        }
        debug('Completed cleanup of WorkOrderTags');
        debug('Starting cleanup of WorkOrderSubscribers');
        const subscriberResult = await pool
            .request()
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        DELETE FROM ShiftLog.WorkOrderSubscribers
        WHERE
          recordDelete_dateTime IS NOT NULL
          AND recordDelete_dateTime < @cutoffDate
          AND workOrderId IN (
            SELECT
              workOrderId
            FROM
              ShiftLog.WorkOrders
            WHERE
              instance = @instance
          )
      `);
        if (subscriberResult.rowsAffected[0] > 0) {
            deletedCount += subscriberResult.rowsAffected[0];
            debug(`Permanently deleted ${subscriberResult.rowsAffected[0]} WorkOrderSubscribers records`);
        }
        await pool
            .request()
            .input('deleteUserName', deleteUserName)
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        UPDATE ShiftLog.WorkOrderSubscribers
        SET
          recordDelete_userName = @deleteUserName,
          recordDelete_dateTime = GETDATE()
        WHERE
          recordDelete_dateTime IS NULL
          AND workOrderId IN (
            SELECT
              workOrderId
            FROM
              ShiftLog.WorkOrders
            WHERE
              recordDelete_dateTime IS NOT NULL
              AND recordDelete_dateTime < @cutoffDate
              AND instance = @instance
          )
      `);
        debug('Completed cleanup of WorkOrderSubscribers');
        debug('Starting cleanup of WorkOrderNotes');
        const notesResult = await pool
            .request()
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        DELETE FROM ShiftLog.WorkOrderNotes
        WHERE
          recordDelete_dateTime IS NOT NULL
          AND recordDelete_dateTime < @cutoffDate
          AND workOrderId IN (
            SELECT
              workOrderId
            FROM
              ShiftLog.WorkOrders
            WHERE
              instance = @instance
          )
      `);
        if (notesResult.rowsAffected[0] > 0) {
            deletedCount += notesResult.rowsAffected[0];
            debug(`Permanently deleted ${notesResult.rowsAffected[0]} WorkOrderNotes records`);
        }
        await pool
            .request()
            .input('deleteUserName', deleteUserName)
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        UPDATE ShiftLog.WorkOrderNotes
        SET
          recordDelete_userName = @deleteUserName,
          recordDelete_dateTime = GETDATE()
        WHERE
          recordDelete_dateTime IS NULL
          AND workOrderId IN (
            SELECT
              workOrderId
            FROM
              ShiftLog.WorkOrders
            WHERE
              recordDelete_dateTime IS NOT NULL
              AND recordDelete_dateTime < @cutoffDate
              AND instance = @instance
          )
      `);
        debug('Completed cleanup of WorkOrderNotes');
        debug('Starting cleanup of WorkOrderMilestones');
        const milestonesResult = await pool
            .request()
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        DELETE FROM ShiftLog.WorkOrderMilestones
        WHERE
          recordDelete_dateTime IS NOT NULL
          AND recordDelete_dateTime < @cutoffDate
          AND workOrderId IN (
            SELECT
              workOrderId
            FROM
              ShiftLog.WorkOrders
            WHERE
              instance = @instance
          )
      `);
        if (milestonesResult.rowsAffected[0] > 0) {
            deletedCount += milestonesResult.rowsAffected[0];
            debug(`Permanently deleted ${milestonesResult.rowsAffected[0]} WorkOrderMilestones records`);
        }
        await pool
            .request()
            .input('deleteUserName', deleteUserName)
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        UPDATE ShiftLog.WorkOrderMilestones
        SET
          recordDelete_userName = @deleteUserName,
          recordDelete_dateTime = GETDATE()
        WHERE
          recordDelete_dateTime IS NULL
          AND workOrderId IN (
            SELECT
              workOrderId
            FROM
              ShiftLog.WorkOrders
            WHERE
              recordDelete_dateTime IS NOT NULL
              AND recordDelete_dateTime < @cutoffDate
              AND instance = @instance
          )
      `);
        debug('Completed cleanup of WorkOrderMilestones');
        debug('Starting cleanup of WorkOrderCosts');
        const costsResult = await pool
            .request()
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        DELETE FROM ShiftLog.WorkOrderCosts
        WHERE
          recordDelete_dateTime IS NOT NULL
          AND recordDelete_dateTime < @cutoffDate
          AND workOrderId IN (
            SELECT
              workOrderId
            FROM
              ShiftLog.WorkOrders
            WHERE
              instance = @instance
          )
      `);
        if (costsResult.rowsAffected[0] > 0) {
            deletedCount += costsResult.rowsAffected[0];
            debug(`Permanently deleted ${costsResult.rowsAffected[0]} WorkOrderCosts records`);
        }
        await pool
            .request()
            .input('deleteUserName', deleteUserName)
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        UPDATE ShiftLog.WorkOrderCosts
        SET
          recordDelete_userName = @deleteUserName,
          recordDelete_dateTime = GETDATE()
        WHERE
          recordDelete_dateTime IS NULL
          AND workOrderId IN (
            SELECT
              workOrderId
            FROM
              ShiftLog.WorkOrders
            WHERE
              recordDelete_dateTime IS NOT NULL
              AND recordDelete_dateTime < @cutoffDate
              AND instance = @instance
          )
      `);
        debug('Completed cleanup of WorkOrderCosts');
        debug('Starting cleanup of WorkOrderEquipment');
        const workOrderEquipmentResult = await pool
            .request()
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        DELETE FROM ShiftLog.WorkOrderEquipment
        WHERE
          workOrderId IN (
            SELECT
              workOrderId
            FROM
              ShiftLog.WorkOrders
            WHERE
              recordDelete_dateTime IS NOT NULL
              AND recordDelete_dateTime < @cutoffDate
              AND instance = @instance
          )
      `);
        if (workOrderEquipmentResult.rowsAffected[0] > 0) {
            deletedCount += workOrderEquipmentResult.rowsAffected[0];
            debug(`Permanently deleted ${workOrderEquipmentResult.rowsAffected[0]} WorkOrderEquipment records`);
        }
        await pool
            .request()
            .input('deleteUserName', deleteUserName)
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        UPDATE ShiftLog.WorkOrderEquipment
        SET
          recordDelete_userName = @deleteUserName,
          recordDelete_dateTime = GETDATE()
        WHERE
          recordDelete_dateTime IS NULL
          AND workOrderId IN (
            SELECT
              workOrderId
            FROM
              ShiftLog.WorkOrders
            WHERE
              recordDelete_dateTime IS NOT NULL
              AND recordDelete_dateTime < @cutoffDate
              AND instance = @instance
          )
      `);
        debug('Completed cleanup of WorkOrderEquipment');
        const workOrdersResult = await pool
            .request()
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        DELETE wo
        FROM
          ShiftLog.WorkOrders wo
        WHERE
          wo.recordDelete_dateTime IS NOT NULL
          AND wo.recordDelete_dateTime < @cutoffDate
          AND wo.instance = @instance
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.WorkOrderTags wt
            WHERE
              wt.workOrderId = wo.workOrderId
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.WorkOrderSubscribers wt
            WHERE
              wt.workOrderId = wo.workOrderId
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.WorkOrderNotes wn
            WHERE
              wn.workOrderId = wo.workOrderId
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.WorkOrderMilestones wm
            WHERE
              wm.workOrderId = wo.workOrderId
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.WorkOrderAttachments wa
            WHERE
              wa.workOrderId = wo.workOrderId
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.WorkOrderCosts wc
            WHERE
              wc.workOrderId = wo.workOrderId
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.WorkOrderEquipment woe
            WHERE
              woe.workOrderId = wo.workOrderId
          )
      `);
        if (workOrdersResult.rowsAffected[0] > 0) {
            deletedCount += workOrdersResult.rowsAffected[0];
            debug(`Permanently deleted ${workOrdersResult.rowsAffected[0]} WorkOrders records`);
        }
        const locationsResult = await pool
            .request()
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        DELETE l
        FROM
          ShiftLog.Locations l
        WHERE
          l.recordDelete_dateTime IS NOT NULL
          AND l.recordDelete_dateTime < @cutoffDate
          AND l.instance = @instance
      `);
        if (locationsResult.rowsAffected[0] > 0) {
            deletedCount += locationsResult.rowsAffected[0];
            debug(`Permanently deleted ${locationsResult.rowsAffected[0]} Locations records`);
        }
        const workOrderTypesResult = await pool
            .request()
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        DELETE wot
        FROM
          ShiftLog.WorkOrderTypes wot
        WHERE
          wot.recordDelete_dateTime IS NOT NULL
          AND wot.recordDelete_dateTime < @cutoffDate
          AND wot.instance = @instance
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.WorkOrders wo
            WHERE
              wo.workOrderTypeId = wot.workOrderTypeId
          )
      `);
        if (workOrderTypesResult.rowsAffected[0] > 0) {
            deletedCount += workOrderTypesResult.rowsAffected[0];
            debug(`Permanently deleted ${workOrderTypesResult.rowsAffected[0]} WorkOrderTypes records`);
        }
        const dataListItemsResult = await pool
            .request()
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        DELETE dli
        FROM
          ShiftLog.DataListItems dli
        WHERE
          dli.recordDelete_dateTime IS NOT NULL
          AND dli.recordDelete_dateTime < @cutoffDate
          AND dli.instance = @instance
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.WorkOrders wo
            WHERE
              (
                wo.workOrderStatusDataListItemId = dli.dataListItemId
              )
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.Equipment e
            WHERE
              e.equipmentTypeDataListItemId = dli.dataListItemId
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.Shifts s
            WHERE
              (
                s.shiftTimeDataListItemId = dli.dataListItemId
                OR s.shiftTypeDataListItemId = dli.dataListItemId
              )
          )
      `);
        if (dataListItemsResult.rowsAffected[0] > 0) {
            deletedCount += dataListItemsResult.rowsAffected[0];
            debug(`Permanently deleted ${dataListItemsResult.rowsAffected[0]} DataListItems records`);
        }
        const dataListsResult = await pool
            .request()
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        DELETE dl
        FROM
          ShiftLog.DataLists dl
        WHERE
          dl.recordDelete_dateTime IS NOT NULL
          AND dl.recordDelete_dateTime < @cutoffDate
          AND dl.instance = @instance
          AND dl.isSystemList = 0
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.DataListItems dli
            WHERE
              dli.instance = dl.instance
              AND dli.dataListKey = dl.dataListKey
          )
      `);
        if (dataListsResult.rowsAffected[0] > 0) {
            deletedCount += dataListsResult.rowsAffected[0];
            debug(`Permanently deleted ${dataListsResult.rowsAffected[0]} DataLists records`);
        }
        const crewsResult = await pool
            .request()
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        DELETE c
        FROM
          ShiftLog.Crews c
        WHERE
          c.recordDelete_dateTime IS NOT NULL
          AND c.recordDelete_dateTime < @cutoffDate
          AND c.instance = @instance
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.CrewMembers cm
            WHERE
              cm.crewId = c.crewId
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.ShiftCrews sc
            WHERE
              sc.crewId = c.crewId
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.ShiftEmployees se
            WHERE
              se.crewId = c.crewId
          )
      `);
        if (crewsResult.rowsAffected[0] > 0) {
            deletedCount += crewsResult.rowsAffected[0];
            debug(`Permanently deleted ${crewsResult.rowsAffected[0]} Crews records`);
        }
        const employeesResult = await pool
            .request()
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        DELETE e
        FROM
          ShiftLog.Employees e
        WHERE
          e.recordDelete_dateTime IS NOT NULL
          AND e.recordDelete_dateTime < @cutoffDate
          AND e.instance = @instance
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.CrewMembers cm
            WHERE
              cm.instance = e.instance
              AND cm.employeeNumber = e.employeeNumber
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.Shifts s
            WHERE
              s.instance = e.instance
              AND s.supervisorEmployeeNumber = e.employeeNumber
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.ShiftEmployees se
            WHERE
              se.instance = e.instance
              AND se.employeeNumber = e.employeeNumber
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.ShiftEquipment seq
            WHERE
              seq.instance = e.instance
              AND seq.employeeNumber = e.employeeNumber
          )
      `);
        if (employeesResult.rowsAffected[0] > 0) {
            deletedCount += employeesResult.rowsAffected[0];
            debug(`Permanently deleted ${employeesResult.rowsAffected[0]} Employees records`);
        }
        const equipmentResult = await pool
            .request()
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        DELETE eq
        FROM
          ShiftLog.Equipment eq
        WHERE
          eq.recordDelete_dateTime IS NOT NULL
          AND eq.recordDelete_dateTime < @cutoffDate
          AND eq.instance = @instance
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.ShiftEquipment se
            WHERE
              se.instance = eq.instance
              AND se.equipmentNumber = eq.equipmentNumber
          )
      `);
        if (equipmentResult.rowsAffected[0] > 0) {
            deletedCount += equipmentResult.rowsAffected[0];
            debug(`Permanently deleted ${equipmentResult.rowsAffected[0]} Equipment records`);
        }
        const shiftsResult = await pool
            .request()
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        DELETE s
        FROM
          ShiftLog.Shifts s
        WHERE
          s.recordDelete_dateTime IS NOT NULL
          AND s.recordDelete_dateTime < @cutoffDate
          AND s.instance = @instance
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.ShiftCrews sc
            WHERE
              sc.shiftId = s.shiftId
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.ShiftEmployees se
            WHERE
              se.shiftId = s.shiftId
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.ShiftEquipment seq
            WHERE
              seq.shiftId = s.shiftId
          )
      `);
        if (shiftsResult.rowsAffected[0] > 0) {
            deletedCount += shiftsResult.rowsAffected[0];
            debug(`Permanently deleted ${shiftsResult.rowsAffected[0]} Shifts records`);
        }
        const timesheetsResult = await pool
            .request()
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        DELETE t
        FROM
          ShiftLog.Timesheets t
        WHERE
          t.recordDelete_dateTime IS NOT NULL
          AND t.recordDelete_dateTime < @cutoffDate
          AND t.instance = @instance
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.TimesheetColumns tc
            WHERE
              tc.timesheetId = t.timesheetId
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.TimesheetRows tr
            WHERE
              tr.timesheetId = t.timesheetId
          )
      `);
        if (timesheetsResult.rowsAffected[0] > 0) {
            deletedCount += timesheetsResult.rowsAffected[0];
            debug(`Permanently deleted ${timesheetsResult.rowsAffected[0]} Timesheets records`);
        }
        const userGroupsResult = await pool
            .request()
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        DELETE ug
        FROM
          ShiftLog.UserGroups ug
        WHERE
          ug.recordDelete_dateTime IS NOT NULL
          AND ug.recordDelete_dateTime < @cutoffDate
          AND ug.instance = @instance
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.UserGroupMembers ugm
            WHERE
              ugm.userGroupId = ug.userGroupId
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.DataListItems dli
            WHERE
              dli.userGroupId = ug.userGroupId
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.Employees e
            WHERE
              e.userGroupId = ug.userGroupId
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.Equipment eq
            WHERE
              eq.userGroupId = ug.userGroupId
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.WorkOrderTypes wot
            WHERE
              wot.userGroupId = ug.userGroupId
          )
      `);
        if (userGroupsResult.rowsAffected[0] > 0) {
            deletedCount += userGroupsResult.rowsAffected[0];
            debug(`Permanently deleted ${userGroupsResult.rowsAffected[0]} UserGroups records`);
        }
        const usersResult = await pool
            .request()
            .input('cutoffDate', cutoffDate)
            .input('instance', instance)
            .query(`
        DELETE u
        FROM
          ShiftLog.Users u
        WHERE
          u.recordDelete_dateTime IS NOT NULL
          AND u.recordDelete_dateTime < @cutoffDate
          AND u.instance = @instance
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.UserSettings us
            WHERE
              us.instance = u.instance
              AND us.userName = u.userName
          )
          AND NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.UserGroupMembers ugm
            WHERE
              ugm.instance = u.instance
              AND ugm.userName = u.userName
          )
      `);
        if (usersResult.rowsAffected[0] > 0) {
            deletedCount += usersResult.rowsAffected[0];
            debug(`Permanently deleted ${usersResult.rowsAffected[0]} Users records`);
        }
        debug(`Cleanup task completed. Total records deleted: ${deletedCount}`);
        return {
            success: true,
            deletedCount,
            errors
        };
    }
    catch (error) {
        const errorMessage = `Cleanup task failed: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMessage);
        debug(error);
        return {
            success: false,
            deletedCount,
            errors
        };
    }
}
