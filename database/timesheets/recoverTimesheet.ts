import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function recoverTimesheet(
  timesheetId: number | string,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('timesheetId', timesheetId)
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', userName).query(/* sql */ `
      update ShiftLog.Timesheets
      set
        recordDelete_userName = null,
        recordDelete_dateTime = null,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      where timesheetId = @timesheetId
        and instance = @instance
        and recordDelete_dateTime is not null
    `)) as mssql.IResult<Record<string, never>>

  return result.rowsAffected[0] > 0
}
