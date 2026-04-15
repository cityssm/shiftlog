import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
import { sendNotificationWorkerMessage } from '../../helpers/notification.helpers.js';
import getWorkOrder from './getWorkOrder.js';
export default async function createWorkOrderMilestone(form, userName) {
    const workOrder = await getWorkOrder(form.workOrderId);
    if (workOrder === undefined) {
        return undefined;
    }
    const pool = await getShiftLogConnectionPool();
    const orderResult = await pool
        .request()
        .input('workOrderId', form.workOrderId)
        .query(`
      SELECT
        isnull(max(orderNumber), 0) + 1 AS nextOrderNumber
      FROM
        ShiftLog.WorkOrderMilestones
      WHERE
        workOrderId = @workOrderId
        AND recordDelete_dateTime IS NULL
    `);
    const nextOrderNumber = orderResult.recordset[0].nextOrderNumber;
    const result = await pool
        .request()
        .input('workOrderId', form.workOrderId)
        .input('milestoneTitle', form.milestoneTitle)
        .input('milestoneDescription', form.milestoneDescription ?? '')
        .input('milestoneDueDateTime', form.milestoneDueDateTimeString
        ? new Date(form.milestoneDueDateTimeString)
        : null)
        .input('milestoneCompleteDateTime', form.milestoneCompleteDateTimeString
        ? new Date(form.milestoneCompleteDateTimeString)
        : null)
        .input('assignedToId', form.assignedToId && form.assignedToId !== '' ? form.assignedToId : null)
        .input('orderNumber', nextOrderNumber)
        .input('userName', userName)
        .query(`
      INSERT INTO
        ShiftLog.WorkOrderMilestones (
          workOrderId,
          milestoneTitle,
          milestoneDescription,
          milestoneDueDateTime,
          milestoneCompleteDateTime,
          assignedToId,
          orderNumber,
          recordCreate_userName,
          recordUpdate_userName
        ) output inserted.workOrderMilestoneId
      VALUES
        (
          @workOrderId,
          @milestoneTitle,
          @milestoneDescription,
          @milestoneDueDateTime,
          @milestoneCompleteDateTime,
          @assignedToId,
          @orderNumber,
          @userName,
          @userName
        )
    `);
    if (result.rowsAffected[0] > 0) {
        sendNotificationWorkerMessage('workOrder.update', typeof form.workOrderId === 'string'
            ? Number.parseInt(form.workOrderId, 10)
            : form.workOrderId);
    }
    return result.recordset[0].workOrderMilestoneId;
}
