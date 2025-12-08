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
        const trimmedTitle = milestone.milestoneTitle.trim();
        const trimmedDescription = milestone.milestoneDescription.trim();
        if (trimmedTitle !== '' && trimmedTitle.length <= 100) {
            await pool
                .request()
                .input('workOrderTypeId', workOrderTypeId)
                .input('milestoneTitle', trimmedTitle)
                .input('milestoneDescription', trimmedDescription)
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
