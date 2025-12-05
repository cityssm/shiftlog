import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateWorkOrderTypeDefaultMilestones(workOrderTypeId, defaultMilestones) {
    const pool = await getShiftLogConnectionPool();
    // Delete existing default milestones
    await pool
        .request()
        .input('workOrderTypeId', workOrderTypeId)
        .query(/* sql */ `
      delete from ShiftLog.WorkOrderTypeMilestones
      where workOrderTypeId = @workOrderTypeId
    `);
    // Insert new default milestones
    for (const milestone of defaultMilestones) {
        if (milestone.milestoneTitle.trim() !== '') {
            await pool
                .request()
                .input('workOrderTypeId', workOrderTypeId)
                .input('milestoneTitle', milestone.milestoneTitle.trim())
                .input('milestoneDescription', milestone.milestoneDescription.trim())
                .input('orderNumber', milestone.orderNumber)
                .query(/* sql */ `
          insert into ShiftLog.WorkOrderTypeMilestones (
            workOrderTypeId,
            milestoneTitle,
            milestoneDescription,
            orderNumber
          )
          values (
            @workOrderTypeId,
            @milestoneTitle,
            @milestoneDescription,
            @orderNumber
          )
        `);
        }
    }
    return true;
}
