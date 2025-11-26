import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { UserGroup } from '../../types/record.types.js'

export default async function getUserGroup(
  userGroupId: number
): Promise<UserGroup | undefined> {
  const pool = await getShiftLogConnectionPool()

  const groupResult = (await pool
    .request()
    .input('userGroupId', userGroupId)
    .input('instance', getConfigProperty('application.instance'))
    .query(/* sql */ `
      select userGroupId, userGroupName,
        recordCreate_userName, recordCreate_dateTime,
        recordUpdate_userName, recordUpdate_dateTime
      from ShiftLog.UserGroups
      where userGroupId = @userGroupId
        and instance = @instance
        and recordDelete_dateTime is null
    `)) as mssql.IResult<UserGroup>

  if (groupResult.recordset.length === 0) {
    return undefined
  }

  const userGroup = groupResult.recordset[0]

  // Get members
  const membersResult = await pool
    .request()
    .input('userGroupId', userGroupId)
    .input('instance', getConfigProperty('application.instance'))
    .query(/* sql */ `
      select userName
      from ShiftLog.UserGroupMembers
      where userGroupId = @userGroupId
        and instance = @instance
      order by userName
    `)

  userGroup.members = membersResult.recordset.map(
    (row: { userName: string }) => row.userName
  )
  userGroup.memberCount = userGroup.members.length

  return userGroup
}
