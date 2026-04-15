import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getWorkOrderTypeDefaultMilestones(workOrderTypeId) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('workOrderTypeId', workOrderTypeId)
        .query(`
      SELECT
        workOrderTypeId,
        milestoneTitle,
        milestoneDescription,
        dueDays,
        orderNumber
      FROM
        ShiftLog.WorkOrderTypeMilestones
      WHERE
        workOrderTypeId = @workOrderTypeId
      ORDER BY
        orderNumber,
        milestoneTitle
    `);
    return result.recordset;
}
