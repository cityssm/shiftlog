import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
import { dateTimeInputToSqlDateTime } from '../../helpers/dateTime.helpers.js';
import { sendNotificationWorkerMessage } from '../../helpers/notification.helpers.js';
import getWorkOrderType from '../workOrderTypes/getWorkOrderType.js';
import getWorkOrderTypeDefaultMilestones from '../workOrderTypes/getWorkOrderTypeDefaultMilestones.js';
export default async function createWorkOrder(createWorkOrderForm, user) {
    const pool = await getShiftLogConnectionPool();
    const workOrderTypeId = typeof createWorkOrderForm.workOrderTypeId === 'string'
        ? Number.parseInt(createWorkOrderForm.workOrderTypeId, 10)
        : createWorkOrderForm.workOrderTypeId;
    const workOrderType = await getWorkOrderType(workOrderTypeId, user);
    if (workOrderType === undefined) {
        throw new Error('Invalid work order type.');
    }
    const openDateTime = new Date(createWorkOrderForm.workOrderOpenDateTimeString);
    const currentYear = openDateTime.getFullYear();
    let calculatedDueDateTime = null;
    if (createWorkOrderForm.workOrderDueDateTimeString === '' &&
        workOrderType.dueDays !== null &&
        workOrderType.dueDays !== undefined &&
        workOrderType.dueDays > 0) {
        calculatedDueDateTime = new Date(openDateTime);
        calculatedDueDateTime.setDate(calculatedDueDateTime.getDate() + workOrderType.dueDays);
    }
    const sequenceResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('year', currentYear)
        .input('workOrderNumberPrefix', workOrderType.workOrderNumberPrefix)
        .query(`
      SELECT
        isnull(max(workOrderNumberSequence), 0) + 1 AS nextSequence
      FROM
        ShiftLog.WorkOrders
      WHERE
        instance = @instance
        AND workOrderNumberPrefix = @workOrderNumberPrefix
        AND workOrderNumberYear = @year
    `);
    const nextSequence = sequenceResult.recordset[0].nextSequence;
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('workOrderNumberPrefix', workOrderType.workOrderNumberPrefix)
        .input('workOrderNumberYear', currentYear)
        .input('workOrderNumberSequence', nextSequence)
        .input('workOrderTypeId', createWorkOrderForm.workOrderTypeId)
        .input('workOrderStatusDataListItemId', createWorkOrderForm.workOrderStatusDataListItemId === ''
        ? null
        : createWorkOrderForm.workOrderStatusDataListItemId)
        .input('workOrderPriorityDataListItemId', createWorkOrderForm.workOrderPriorityDataListItemId === ''
        ? null
        : createWorkOrderForm.workOrderPriorityDataListItemId)
        .input('workOrderDetails', createWorkOrderForm.workOrderDetails)
        .input('workOrderOpenDateTime', dateTimeInputToSqlDateTime(createWorkOrderForm.workOrderOpenDateTimeString))
        .input('workOrderDueDateTime', createWorkOrderForm.workOrderDueDateTimeString === ''
        ? calculatedDueDateTime
        : dateTimeInputToSqlDateTime(createWorkOrderForm.workOrderDueDateTimeString))
    .input('requestorName', createWorkOrderForm.requestorName)
    .input('requestorContactInfo', createWorkOrderForm.requestorContactInfo)
    .input('requestorIsSubscribed', createWorkOrderForm.requestorIsSubscribed === '1')
        .input('locationLatitude', (createWorkOrderForm.locationLatitude ?? '') === ''
        ? null
        : createWorkOrderForm.locationLatitude)
        .input('locationLongitude', (createWorkOrderForm.locationLongitude ?? '') === ''
        ? null
        : createWorkOrderForm.locationLongitude)
        .input('locationAddress1', createWorkOrderForm.locationAddress1)
        .input('locationAddress2', createWorkOrderForm.locationAddress2)
        .input('locationCityProvince', createWorkOrderForm.locationCityProvince)
        .input('assignedToId', createWorkOrderForm.assignedToId === ''
        ? null
        : createWorkOrderForm.assignedToId)
        .input('userName', user.userName)
        .query(`
      INSERT INTO
        ShiftLog.WorkOrders (
          instance,
          workOrderNumberPrefix,
          workOrderNumberYear,
          workOrderNumberSequence,
          workOrderTypeId,
          workOrderStatusDataListItemId,
          workOrderPriorityDataListItemId,
          workOrderDetails,
          workOrderOpenDateTime,
          workOrderDueDateTime,
            requestorName,
            requestorContactInfo,
            requestorIsSubscribed,
            locationLatitude,
          locationLongitude,
          locationAddress1,
          locationAddress2,
          locationCityProvince,
          assignedToId,
          recordCreate_userName,
          recordUpdate_userName
        ) output inserted.workOrderId
      VALUES
        (
          @instance,
          @workOrderNumberPrefix,
          @workOrderNumberYear,
          @workOrderNumberSequence,
          @workOrderTypeId,
          @workOrderStatusDataListItemId,
          @workOrderPriorityDataListItemId,
          @workOrderDetails,
          @workOrderOpenDateTime,
          @workOrderDueDateTime,
            @requestorName,
            @requestorContactInfo,
            @requestorIsSubscribed,
            @locationLatitude,
          @locationLongitude,
          @locationAddress1,
          @locationAddress2,
          @locationCityProvince,
          @assignedToId,
          @userName,
          @userName
        )
    `);
    const workOrderId = result.recordset[0].workOrderId;
    const defaultMilestones = await getWorkOrderTypeDefaultMilestones(workOrderTypeId);
    for (const defaultMilestone of defaultMilestones) {
        let milestoneDueDateTime = null;
        if (defaultMilestone.dueDays !== null &&
            defaultMilestone.dueDays !== undefined &&
            defaultMilestone.dueDays > 0) {
            milestoneDueDateTime = new Date(openDateTime);
            milestoneDueDateTime.setDate(milestoneDueDateTime.getDate() + defaultMilestone.dueDays);
        }
        await pool
            .request()
            .input('workOrderId', workOrderId)
            .input('milestoneTitle', defaultMilestone.milestoneTitle)
            .input('milestoneDescription', defaultMilestone.milestoneDescription)
            .input('milestoneDueDateTime', milestoneDueDateTime)
            .input('orderNumber', defaultMilestone.orderNumber)
            .input('userName', user.userName)
            .query(`
        INSERT INTO
          ShiftLog.WorkOrderMilestones (
            workOrderId,
            milestoneTitle,
            milestoneDescription,
            milestoneDueDateTime,
            orderNumber,
            recordCreate_userName,
            recordUpdate_userName
          )
        VALUES
          (
            @workOrderId,
            @milestoneTitle,
            @milestoneDescription,
            @milestoneDueDateTime,
            @orderNumber,
            @userName,
            @userName
          )
      `);
    }
    sendNotificationWorkerMessage('workOrder.create', workOrderId);
    return workOrderId;
}
