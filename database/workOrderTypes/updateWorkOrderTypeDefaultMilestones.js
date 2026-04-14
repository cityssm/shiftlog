import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateWorkOrderTypeDefaultMilestones(workOrderTypeId, defaultMilestones) {
    const pool = await getShiftLogConnectionPool();
    await pool
        .request()
        .input('workOrderTypeId', workOrderTypeId)
        .query(`
      delete from ShiftLog.WorkOrderTypeMilestones
      where workOrderTypeId = @workOrderTypeId
    `);
    for (const milestone of defaultMilestones) {
        const trimmedTitle = milestone.milestoneTitle.trim();
        const trimmedDescription = milestone.milestoneDescription.trim();
        if (trimmedTitle !== '' && trimmedTitle.length <= 100) {
            await pool
                .request()
                .input('workOrderTypeId', workOrderTypeId)
                .input('milestoneTitle', trimmedTitle)
                .input('milestoneDescription', trimmedDescription)
                .input('dueDays', milestone.dueDays ?? null)
                .input('orderNumber', milestone.orderNumber)
                .query(`
          insert into ShiftLog.WorkOrderTypeMilestones (
            workOrderTypeId,
            milestoneTitle,
            milestoneDescription,
            dueDays,
            orderNumber
          )
          values (
            @workOrderTypeId,
            @milestoneTitle,
            @milestoneDescription,
            @dueDays,
            @orderNumber
          )
        `);
        }
    }
    return true;
}
