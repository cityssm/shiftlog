import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function getShiftCrews(shiftId, user) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    const sql = /* sql */ `
    SELECT
      sc.shiftId,
      sc.crewId,
      sc.shiftCrewNote,
      c.crewName,
      c.userGroupId
    FROM
      ShiftLog.ShiftCrews sc
      INNER JOIN ShiftLog.Crews c ON sc.crewId = c.crewId
    WHERE
      sc.shiftId = @shiftId
      AND c.recordDelete_dateTime IS NULL ${user === undefined
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
    ORDER BY
      c.crewName
  `;
    const result = (await pool
        .request()
        .input('shiftId', shiftId)
        .input('userName', user?.userName)
        .query(sql));
    return result.recordset;
}
