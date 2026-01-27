import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getShiftEmployees(shiftId, user) {
    const pool = await getShiftLogConnectionPool();
    const sql = /* sql */ `
    SELECT
      se.shiftId,
      se.employeeNumber,
      se.crewId,
      se.shiftEmployeeNote,
      e.firstName,
      e.lastName,
      e.userGroupId,
      c.crewName
    FROM
      ShiftLog.ShiftEmployees se
      INNER JOIN ShiftLog.Employees e ON se.instance = e.instance
      AND se.employeeNumber = e.employeeNumber
      LEFT JOIN ShiftLog.Crews c ON se.crewId = c.crewId
    WHERE
      se.shiftId = @shiftId
      AND e.recordDelete_dateTime IS NULL ${user === undefined
        ? ''
        : /* sql */ `
            AND (
              e.userGroupId IS NULL
              OR e.userGroupId IN (
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
      e.lastName,
      e.firstName
  `;
    const result = await pool
        .request()
        .input('shiftId', shiftId)
        .input('userName', user?.userName)
        .query(sql);
    return result.recordset;
}
