import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteAssignedToItem(
  assignedToId: number | string,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('assignedToId', assignedToId)
    .input('userName', userName).query(/* sql */ `
      update ShiftLog.AssignedTo
      set
        recordDelete_userName = @userName,
        recordDelete_dateTime = getdate()
      where assignedToId = @assignedToId
        and instance = @instance
        and recordDelete_dateTime is null
    `)

  return result.rowsAffected[0] > 0
}
