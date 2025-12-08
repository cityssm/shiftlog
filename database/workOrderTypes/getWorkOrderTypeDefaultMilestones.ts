import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrderTypeDefaultMilestone } from '../../types/record.types.js'

export default async function getWorkOrderTypeDefaultMilestones(
  workOrderTypeId: number
): Promise<WorkOrderTypeDefaultMilestone[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('workOrderTypeId', workOrderTypeId)
    .query<WorkOrderTypeDefaultMilestone>(/* sql */ `
      select
        workOrderTypeId,
        milestoneTitle,
        milestoneDescription,
        dueDays,
        orderNumber
      from ShiftLog.WorkOrderTypeMilestones
      where workOrderTypeId = @workOrderTypeId
      order by orderNumber, milestoneTitle
    `)

  return result.recordset
}
