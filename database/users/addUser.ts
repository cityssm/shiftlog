import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

async function insertNewUser(
  newUserName: string,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  try {
    const pool = await getShiftLogConnectionPool()

    await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('userName', newUserName)
      .input('recordCreate_userName', user.userName)
      .input('recordCreate_dateTime', currentDate)
      .input('recordUpdate_userName', user.userName)
      .input('recordUpdate_dateTime', currentDate)
      .query(/* sql */ `
        INSERT INTO
          ShiftLog.Users (
            instance,
            userName,
            recordCreate_userName,
            recordCreate_dateTime,
            recordUpdate_userName,
            recordUpdate_dateTime
          )
        VALUES
          (
            @instance,
            @userName,
            @recordCreate_userName,
            @recordCreate_dateTime,
            @recordUpdate_userName,
            @recordUpdate_dateTime
          )
      `)

    return true
  } catch {
    return false
  }
}

async function restoreDeletedUser(
  newUserName: string,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', newUserName)
    .input('recordUpdate_userName', user.userName)
    .input('recordUpdate_dateTime', currentDate)
    .query(/* sql */ `
      UPDATE ShiftLog.Users
      SET
        recordUpdate_userName = @recordUpdate_userName,
        recordUpdate_dateTime = @recordUpdate_dateTime,
        recordDelete_userName = NULL,
        recordDelete_timeMillis = NULL
      WHERE
        instance = @instance
        AND userName = @userName
    `)

  return result.rowsAffected.length > 0
}

export default async function addUser(
  newUserName: string,
  user: User
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  // Check if an user with the same name already exists

  const recordDeleteResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', newUserName)
    .query<{ recordDelete_dateTime: Date | null }>(/* sql */ `
      SELECT
        recordDelete_dateTime
      FROM
        ShiftLog.Users
      WHERE
        instance = @instance
        AND userName = @userName
    `)

  let success = false

  if (recordDeleteResult.recordset.length === 0) {
    success = await insertNewUser(newUserName, user)
  } else if (recordDeleteResult.recordset[0].recordDelete_dateTime !== null) {
    success = await restoreDeletedUser(newUserName, user)
  }

  return success
}
