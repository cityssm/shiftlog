// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getShifts(filters, user) {
    const pool = await getShiftLogConnectionPool();
    let sql = /* sql */ `
    select
      s.shiftId, s.shiftDate,

      s.shiftTimeDataListItemId,
      sTime.dataListItem as shiftTimeDataListItem,

      s.shiftTypeDataListItemId,
      sType.dataListItem as shiftTypeDataListItem,
      
      s.supervisorEmployeeNumber,
      e.firstName as supervisorFirstName,
      e.lastName as supervisorLastName,
      e.userName as supervisorUserName,

      s.shiftDescription

    from ShiftLog.Shifts s

    left join ShiftLog.DataListItems sTime
      on s.shiftTimeDataListItemId = sTime.dataListItemId

    left join ShiftLog.DataListItems sType
      on s.shiftTypeDataListItemId = sType.dataListItemId
      
    left join ShiftLog.Employees e
      on s.supervisorEmployeeNumber = e.employeeNumber

    where s.recordDelete_dateTime is null

    ${user === undefined
        ? ''
        : `
            and (
              sType.userGroupId is null or sType.userGroupId in (
                select userGroupId
                from ShiftLog.UserGroupMembers
                where userName = @userName
              )
            )
          `}    
  `;
    if (filters.shiftDateString !== undefined) {
        sql += /* sql */ `
      and s.shiftDate = @shiftDateString
    `;
    }
    sql += /* sql */ `
    order by s.shiftDate desc, sType.dataListItem, sTime.dataListItem
  `;
    const shiftsResult = (await pool
        .request()
        .input('shiftDateString', filters.shiftDateString ?? null)
        .input('userName', user?.userName)
        .query(sql));
    return shiftsResult.recordset;
}
