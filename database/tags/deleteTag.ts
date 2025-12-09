import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteTag(
  tagName: string,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  try {
    const pool = await getShiftLogConnectionPool()

    const result = await pool
      .request()
      .input('tagName', tagName)
      .input('recordDelete_userName', user.userName)
      .input('recordDelete_dateTime', currentDate).query(/* sql */ `
        UPDATE ShiftLog.Tags
        SET recordDelete_userName = @recordDelete_userName,
            recordDelete_dateTime = @recordDelete_dateTime
        WHERE tagName = @tagName
          AND recordDelete_dateTime IS NULL
      `)

    return result.rowsAffected[0] > 0
  } catch {
    return false
  }
}
