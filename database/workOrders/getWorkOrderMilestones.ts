import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrderMilestone } from '../../types/record.types.js'

type WorkOrderMilestoneWithAssignedTo = WorkOrderMilestone & {
  assignedToName?: string
}

export default async function getWorkOrderMilestones(
  workOrderId: number | string
): Promise<WorkOrderMilestoneWithAssignedTo[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('workOrderId', workOrderId)
    .input('instance', getConfigProperty('application.instance'))
    .query<WorkOrderMilestoneWithAssignedTo>(/* sql */ `
      SELECT
        m.workOrderMilestoneId,
        m.workOrderId,
        m.milestoneTitle,
        m.milestoneDescription,
        m.milestoneDueDateTime,
        m.milestoneCompleteDateTime,
        m.assignedToId,
        a.assignedToName,
        m.orderNumber,
        m.recordCreate_userName,
        m.recordCreate_dateTime,
        m.recordUpdate_userName,
        m.recordUpdate_dateTime
      FROM
        ShiftLog.WorkOrderMilestones m
        LEFT JOIN ShiftLog.AssignedTo a ON m.assignedToId = a.assignedToId
      WHERE
        m.workOrderId = @workOrderId
        AND m.recordDelete_dateTime IS NULL
        AND m.workOrderId IN (
          SELECT
            workOrderId
          FROM
            ShiftLog.WorkOrders
          WHERE
            recordDelete_dateTime IS NULL
            AND instance = @instance
        )
      ORDER BY
        CASE
          WHEN m.milestoneCompleteDateTime IS NULL THEN 0
          ELSE 1
        END,
        CASE
          WHEN m.milestoneCompleteDateTime IS NULL
          AND m.milestoneDueDateTime IS NOT NULL THEN 0
          ELSE 1
        END,
        m.milestoneDueDateTime,
        m.orderNumber,
        m.workOrderMilestoneId
    `)

  return result.recordset
}
