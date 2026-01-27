import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getShift(shiftId, user) {
    const pool = await getShiftLogConnectionPool();
    const sql = /* sql */ `
    SELECT
      s.shiftId,
      s.shiftDate,
      s.shiftTimeDataListItemId,
      sTime.dataListItem AS shiftTimeDataListItem,
      s.shiftTypeDataListItemId,
      sType.dataListItem AS shiftTypeDataListItem,
      s.supervisorEmployeeNumber,
      e.firstName AS supervisorFirstName,
      e.lastName AS supervisorLastName,
      e.userName AS supervisorUserName,
      s.shiftDescription,
      s.recordLock_dateTime
    FROM
      ShiftLog.Shifts s
      LEFT JOIN ShiftLog.DataListItems sTime ON s.shiftTimeDataListItemId = sTime.dataListItemId
      LEFT JOIN ShiftLog.DataListItems sType ON s.shiftTypeDataListItemId = sType.dataListItemId
      LEFT JOIN ShiftLog.Employees e ON s.supervisorEmployeeNumber = e.employeeNumber
      AND s.instance = e.instance
    WHERE
      s.instance = @instance
      AND s.recordDelete_dateTime IS NULL
      AND s.shiftId = @shiftId ${user === undefined
        ? ''
        : /* sql */ `
            AND (
              sType.userGroupId IS NULL
              OR sType.userGroupId IN (
                SELECT
                  userGroupId
                FROM
                  ShiftLog.UserGroupMembers
                WHERE
                  userName = @userName
              )
            )
          `}
  `;
    const shiftsResult = (await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('shiftId', shiftId)
        .input('userName', user?.userName)
        .query(sql));
    if (shiftsResult.recordset.length === 0) {
        return undefined;
    }
    const shift = shiftsResult.recordset[0];
    return shift;
}
