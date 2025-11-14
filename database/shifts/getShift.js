import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getShift(shiftId, user) {
    const pool = await getShiftLogConnectionPool();
    const sql = /* sql */ `
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

      s.shiftDescription,

      s.recordLock_dateTime

    from ShiftLog.Shifts s

    left join ShiftLog.DataListItems sTime
      on s.shiftTimeDataListItemId = sTime.dataListItemId

    left join ShiftLog.DataListItems sType
      on s.shiftTypeDataListItemId = sType.dataListItemId
      
    left join ShiftLog.Employees e
      on s.supervisorEmployeeNumber = e.employeeNumber

    where s.recordDelete_dateTime is null
      and s.shiftId = @shiftId

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
    const shiftsResult = (await pool
        .request()
        .input('shiftId', shiftId)
        .input('userName', user?.userName)
        .query(sql));
    if (shiftsResult.recordset.length === 0) {
        return undefined;
    }
    const shift = shiftsResult.recordset[0];
    return shift;
}
