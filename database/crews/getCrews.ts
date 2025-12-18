import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { Crew } from '../../types/record.types.js'

export default async function getCrews(user?: User): Promise<Crew[]> {
  const pool = await getShiftLogConnectionPool()

  const sql = /* sql */ `
    select c.crewId, c.crewName, c.userGroupId,
      ug.userGroupName,
      (select count(*) from ShiftLog.CrewMembers cm where cm.crewId = c.crewId) as memberCount,
      c.recordCreate_userName, c.recordCreate_dateTime,
      c.recordUpdate_userName, c.recordUpdate_dateTime
    from ShiftLog.Crews c
    left join ShiftLog.UserGroups ug on c.userGroupId = ug.userGroupId
    where c.recordDelete_dateTime is null
      and c.instance = @instance
      ${
        user === undefined
          ? ''
          : `
            and (
              c.userGroupId is null or c.userGroupId in (
                select userGroupId
                from ShiftLog.UserGroupMembers
                where userName = @userName
              )
            )
          `
      }
    order by c.crewName
  `

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', user?.userName)
    .query<Crew>(sql)

  return result.recordset
}
