import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteAdhocTask(
  adhocTaskId: number | string,
  sessionUser: {
    userName: string
  }
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('adhocTaskId', adhocTaskId)
    .input('recordDelete_userName', sessionUser.userName)
    .query(/* sql */ `
      UPDATE ShiftLog.AdhocTasks
      SET
        recordDelete_userName = @recordDelete_userName,
        recordDelete_dateTime = getdate()
      WHERE
        adhocTaskId = @adhocTaskId
        AND recordDelete_dateTime IS NULL
    `)

  return result.rowsAffected[0] > 0
}
