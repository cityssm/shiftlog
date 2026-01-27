import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getShiftCrews(shiftId, user) {
    const pool = await getShiftLogConnectionPool();
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
  `;
    const result = await pool
        .request()
        .input('shiftId', shiftId)
        .input('userName', user?.userName)
        .query(sql);
    return result.recordset;
}
