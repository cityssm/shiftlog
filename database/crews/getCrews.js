import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function getCrews(user) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    const sql = /* sql */ `
    select c.crewId, c.crewName, c.userGroupId,
      ug.userGroupName,
      (select count(*) from ShiftLog.CrewMembers cm where cm.crewId = c.crewId) as memberCount,
      c.recordCreate_userName, c.recordCreate_dateTime,
      c.recordUpdate_userName, c.recordUpdate_dateTime
    from ShiftLog.Crews c
    left join ShiftLog.UserGroups ug on c.userGroupId = ug.userGroupId
    where c.recordDelete_dateTime is null
    ${user === undefined
        ? ''
        : `
          and (
            c.userGroupId is null or c.userGroupId in (
              select userGroupId
              from ShiftLog.UserGroupMembers
              where userName = @userName
            )
          )
        `}
    order by c.crewName
  `;
    const result = (await pool
        .request()
        .input('userName', user?.userName)
        .query(sql));
    return result.recordset;
}
