import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getShiftEquipment(shiftId, user) {
    const pool = await getShiftLogConnectionPool();
    const sql = /* sql */ `
    SELECT
      se.shiftId,
      se.equipmentNumber,
      se.employeeNumber,
      se.shiftEquipmentNote,
      eq.equipmentName,
      eq.userGroupId,
      e.firstName AS employeeFirstName,
      e.lastName AS employeeLastName
    FROM
      ShiftLog.ShiftEquipment se
      INNER JOIN ShiftLog.Equipment eq ON se.instance = eq.instance
      AND se.equipmentNumber = eq.equipmentNumber
      LEFT JOIN ShiftLog.Employees e ON se.instance = e.instance
      AND se.employeeNumber = e.employeeNumber
    WHERE
      se.shiftId = @shiftId
      AND eq.recordDelete_dateTime IS NULL ${user === undefined
        ? ''
        : /* sql */ `
            AND (
              eq.userGroupId IS NULL
              OR eq.userGroupId IN (
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
      eq.equipmentName
  `;
    const result = await pool
        .request()
        .input('shiftId', shiftId)
        .input('userName', user?.userName)
        .query(sql);
    return result.recordset;
}
