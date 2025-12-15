import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteCrew(
  crewId: number,
  user: User
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('crewId', crewId)
    .input('recordDelete_userName', user.userName)
    .query(/* sql */ `
      update ShiftLog.Crews
      set recordDelete_userName = @recordDelete_userName,
          recordDelete_dateTime = getdate()
      where instance = @instance
        and crewId = @crewId
        and recordDelete_dateTime is null
    `)

  return result.rowsAffected[0] > 0
}
