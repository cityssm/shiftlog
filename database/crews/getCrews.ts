import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { Crew } from '../../types/record.types.js'

export default async function getCrews(user?: User): Promise<Crew[]> {
  const pool = await getShiftLogConnectionPool()

  const sql = /* sql */ `
    SELECT
      c.crewId,
      c.crewName,
      c.userGroupId,
      ug.userGroupName,
      (
        SELECT
          count(*)
        FROM
          ShiftLog.CrewMembers cm
        WHERE
          cm.crewId = c.crewId
      ) AS memberCount,
      c.recordCreate_userName,
      c.recordCreate_dateTime,
      c.recordUpdate_userName,
      c.recordUpdate_dateTime
    FROM
      ShiftLog.Crews c
      LEFT JOIN ShiftLog.UserGroups ug ON c.userGroupId = ug.userGroupId
    WHERE
      c.recordDelete_dateTime IS NULL
      AND c.instance = @instance ${user === undefined
        ? ''
        : /* sql */ `
            AND (
              c.userGroupId IS NULL
              OR c.userGroupId IN (
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
      c.crewName
  `

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', user?.userName)
    .query<Crew>(sql)

  return result.recordset
}
