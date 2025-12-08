import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface DefaultMilestoneUpdate {
  dueDays?: number | null
  milestoneDescription: string
  milestoneTitle: string
  orderNumber: number
}

export default async function updateWorkOrderTypeDefaultMilestones(
  workOrderTypeId: number,
  defaultMilestones: DefaultMilestoneUpdate[]
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  // Delete existing default milestones
  await pool
    .request()
    .input('workOrderTypeId', workOrderTypeId)
    .query(/* sql */ `
      delete from ShiftLog.WorkOrderTypeMilestones
      where workOrderTypeId = @workOrderTypeId
    `)

  // Insert new default milestones
  for (const milestone of defaultMilestones) {
    const trimmedTitle = milestone.milestoneTitle.trim()
    const trimmedDescription = milestone.milestoneDescription.trim()

    if (trimmedTitle !== '' && trimmedTitle.length <= 100) {
      await pool
        .request()
        .input('workOrderTypeId', workOrderTypeId)
        .input('milestoneTitle', trimmedTitle)
        .input('milestoneDescription', trimmedDescription)
        .input('dueDays', milestone.dueDays ?? null)
        .input('orderNumber', milestone.orderNumber)
        .query(/* sql */ `
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
        `)
    }
  }

  return true
}
