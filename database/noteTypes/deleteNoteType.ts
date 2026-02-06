import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteNoteType(
  noteTypeId: number,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  try {
    const pool = await getShiftLogConnectionPool()

    await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('noteTypeId', noteTypeId)
      .input('recordDelete_userName', user.userName)
      .input('recordDelete_dateTime', currentDate)
      .query(/* sql */ `
        UPDATE
          ShiftLog.NoteTypes
        SET
          recordDelete_userName = @recordDelete_userName,
          recordDelete_dateTime = @recordDelete_dateTime
        WHERE
          instance = @instance
          AND noteTypeId = @noteTypeId
          AND recordDelete_dateTime IS NULL
      `)

    return true
  } catch {
    return false
  }
}
