import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function deleteUser(
  userName: string,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  try {
    const pool = await mssqlPool.connect(
      getConfigProperty('connectors.shiftLog')
    )

    const result = await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('userName', userName)
      .input('recordDelete_userName', user.userName)
      .input('recordDelete_dateTime', currentDate)
      .query(/* sql */ `
        UPDATE ShiftLog.Users
        SET
          recordDelete_userName = @recordDelete_userName,
          recordDelete_dateTime = @recordDelete_dateTime
        WHERE
          instance = @instance
          AND userName = @userName
          AND recordDelete_dateTime IS NULL
      `)

    return result.rowsAffected[0] > 0
  } catch {
    return false
  }
}
