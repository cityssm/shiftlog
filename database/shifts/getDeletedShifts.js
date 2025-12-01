import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getDeletedShifts(user) {
    const pool = await getShiftLogConnectionPool();
    let whereClause = 'where s.instance = @instance and s.recordDelete_dateTime is not null';
    if (user !== undefined) {
        whereClause += `
      and (
        sType.userGroupId is null or sType.userGroupId in (
          select userGroupId
          from ShiftLog.UserGroupMembers
          where userName = @userName
        )
      )
    `;
    }
    const shiftsResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', user?.userName).query(/* sql */ `
      select
        s.shiftId, s.shiftDate,

        s.shiftTimeDataListItemId,
        sTime.dataListItem as shiftTimeDataListItem,

        s.shiftTypeDataListItemId,
        sType.dataListItem as shiftTypeDataListItem,

        s.shiftDetails,

        s.recordDelete_userName,
        s.recordDelete_dateTime

      from ShiftLog.Shifts s

      left join ShiftLog.DataListItems sTime
        on s.shiftTimeDataListItemId = sTime.dataListItemId

      left join ShiftLog.DataListItems sType
        on s.shiftTypeDataListItemId = sType.dataListItemId

      ${whereClause}

      order by s.recordDelete_dateTime desc
    `);
    const shifts = shiftsResult.recordset;
    return shifts;
}
