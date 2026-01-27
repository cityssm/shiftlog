import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { UserGroup } from '../../types/record.types.js'

export default async function getUserGroup(
  userGroupId: number
): Promise<UserGroup | undefined> {
  const pool = await getShiftLogConnectionPool()

  const groupResult = await pool
    .request()
    .input('userGroupId', userGroupId)
    .input('instance', getConfigProperty('application.instance'))
    .query<UserGroup>(/* sql */ `
      SELECT
        userGroupId,
        userGroupName,
        recordCreate_userName,
        recordCreate_dateTime,
        recordUpdate_userName,
        recordUpdate_dateTime
      FROM
        ShiftLog.UserGroups
      WHERE
        userGroupId = @userGroupId
        AND instance = @instance
        AND recordDelete_dateTime IS NULL
    `)

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
      SELECT
        userName
      FROM
        ShiftLog.UserGroupMembers
      WHERE
        userGroupId = @userGroupId
        AND instance = @instance
      ORDER BY
        userName
    `)

  userGroup.members = membersResult.recordset.map(
    (row: { userName: string }) => row.userName
  )
  userGroup.memberCount = userGroup.members.length

  return userGroup
}
