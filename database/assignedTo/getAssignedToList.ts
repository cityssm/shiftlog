import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { AssignedTo } from '../../types/record.types.js'

export default async function getAssignedToList(
  userName?: string
): Promise<AssignedTo[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', userName)
    .query<AssignedTo>(/* sql */ `
      SELECT
        a.assignedToId,
        a.assignedToName,
        a.orderNumber,
        a.userGroupId,
        ug.userGroupName,
        a.recordCreate_userName,
        a.recordCreate_dateTime,
        a.recordUpdate_userName,
        a.recordUpdate_dateTime
      FROM
        ShiftLog.AssignedTo a
        LEFT JOIN ShiftLog.UserGroups ug ON a.userGroupId = ug.userGroupId
      WHERE
        a.instance = @instance
        AND a.recordDelete_dateTime IS NULL ${userName === undefined
          ? ''
          : /* sql */ `
              AND (
                a.userGroupId IS NULL
                OR a.userGroupId IN (
                  SELECT
                    userGroupId
                  FROM
                    ShiftLog.UserGroupMembers
                  WHERE
                    userName = @userName
                )
              )
            `}
      ORDER BY
        a.orderNumber,
        a.assignedToName
    `)

  return result.recordset
}
