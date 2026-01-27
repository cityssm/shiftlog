import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function recoverShift(
  shiftId: number | string,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('shiftId', shiftId)
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', userName)
    .query(/* sql */ `
      UPDATE ShiftLog.Shifts
      SET
        recordDelete_userName = NULL,
        recordDelete_dateTime = NULL,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      WHERE
        shiftId = @shiftId
        AND instance = @instance
        AND recordDelete_dateTime IS NOT NULL
    `)) as mssql.IResult<Record<string, never>>

  return result.rowsAffected[0] > 0
}
