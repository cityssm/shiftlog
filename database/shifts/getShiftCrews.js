import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function getShiftCrews(shiftId, user) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    const sql = /* sql */ `
    select sc.shiftId, sc.crewId, sc.shiftCrewNote,
      c.crewName, c.userGroupId
    from ShiftLog.ShiftCrews sc
    inner join ShiftLog.Crews c on sc.crewId = c.crewId
    where sc.shiftId = @shiftId
      and c.recordDelete_dateTime is null
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
        .input('shiftId', shiftId)
        .input('userName', user?.userName)
        .query(sql));
    return result.recordset;
}
