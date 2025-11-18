import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getTimesheetTypeDataListItems(user) {
    const pool = await getShiftLogConnectionPool();
    const sql = /* sql */ `
    select
      dataListItemId,
      dataListKey,
      dataListItem
    from ShiftLog.DataListItems
    where dataListKey = 'timesheetTypes'
      and recordDelete_dateTime is null
      ${user === undefined
        ? ''
        : `
              and (
                userGroupId is null or userGroupId in (
                  select userGroupId
                  from ShiftLog.UserGroupMembers
                  where userName = @userName
                )
              )
            `}
    order by orderNumber, dataListItem
  `;
    const result = (await pool
        .request()
        .input('userName', user?.userName)
        .query(sql));
    return result.recordset;
}
