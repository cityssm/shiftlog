import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { UserGroup } from '../../types/record.types.js'

export default async function getUserGroups(): Promise<UserGroup[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .query<UserGroup>(/* sql */ `
      SELECT
        ug.userGroupId,
        ug.userGroupName,
        ug.recordCreate_userName,
        ug.recordCreate_dateTime,
        ug.recordUpdate_userName,
        ug.recordUpdate_dateTime,
        count(ugm.userName) AS memberCount
      FROM
        ShiftLog.UserGroups ug
        LEFT JOIN ShiftLog.UserGroupMembers ugm ON ug.userGroupId = ugm.userGroupId
      WHERE
        ug.instance = @instance
        AND ug.recordDelete_dateTime IS NULL
      GROUP BY
        ug.userGroupId,
        ug.userGroupName,
        ug.recordCreate_userName,
        ug.recordCreate_dateTime,
        ug.recordUpdate_userName,
        ug.recordUpdate_dateTime
      ORDER BY
        ug.userGroupName
    `)

  return result.recordset
}
