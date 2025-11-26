import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function addUserGroup(
  userGroupName: string,
  user: User
): Promise<number | undefined> {
  const currentDate = new Date()

  try {
    const pool = await getShiftLogConnectionPool()

    const result = (await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('userGroupName', userGroupName)
      .input('recordCreate_userName', user.userName)
      .input('recordCreate_dateTime', currentDate)
      .input('recordUpdate_userName', user.userName)
      .input('recordUpdate_dateTime', currentDate).query(/* sql */ `
        insert into ShiftLog.UserGroups (
          instance, userGroupName,
          recordCreate_userName, recordCreate_dateTime,
          recordUpdate_userName, recordUpdate_dateTime
        )
        output inserted.userGroupId
        values (
          @instance, @userGroupName,
          @recordCreate_userName, @recordCreate_dateTime,
          @recordUpdate_userName, @recordUpdate_dateTime
        )
      `)) as mssql.IResult<{ userGroupId: number }>

    return result.recordset[0].userGroupId
  } catch {
    return undefined
  }
}
