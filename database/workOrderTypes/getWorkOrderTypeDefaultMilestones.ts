import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrderTypeDefaultMilestone } from '../../types/record.types.js'

export default async function getWorkOrderTypeDefaultMilestones(
  workOrderTypeId: number
): Promise<WorkOrderTypeDefaultMilestone[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('workOrderTypeId', workOrderTypeId)
    // eslint-disable-next-line no-secrets/no-secrets
    .query<WorkOrderTypeDefaultMilestone>(/* sql */ `
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
    `)

  return result.recordset
}
