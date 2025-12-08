import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getWorkOrderTypeDefaultMilestones(workOrderTypeId) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('workOrderTypeId', workOrderTypeId)
        .query(/* sql */ `
      select
        workOrderTypeId,
        milestoneTitle,
        milestoneDescription,
        dueDays,
        orderNumber
      from ShiftLog.WorkOrderTypeMilestones
      where workOrderTypeId = @workOrderTypeId
      order by orderNumber, milestoneTitle
    `);
    return result.recordset;
}
