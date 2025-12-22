import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getAdhocTaskTypeDataListItems(sessionUser) {
    const pool = await getShiftLogConnectionPool();
    const request = pool.request().input('instance', getConfigProperty('application.instance'));
    let queryString = /* sql */ `
    select
      i.dataListItemId,
      i.dataListItem,
      i.orderNumber,
      i.userGroupId,
      g.userGroupName
    from ShiftLog.DataListItems i
    left join ShiftLog.UserGroups g on i.userGroupId = g.userGroupId
    where i.instance = @instance
      and i.dataListKey = 'adhocTaskTypes'
      and i.recordDelete_dateTime is null
  `;
    if (sessionUser !== undefined &&
        sessionUser.userGroupIds !== undefined &&
        sessionUser.userGroupIds.length > 0) {
        const userGroupIdString = sessionUser.userGroupIds.join(',');
        queryString += /* sql */ ` and (i.userGroupId is null or i.userGroupId in (${userGroupIdString}))`;
    }
    else {
        queryString += /* sql */ ` and i.userGroupId is null`;
    }
    queryString += /* sql */ `
    order by i.orderNumber, i.dataListItem
  `;
    const result = (await request.query(queryString));
    return result.recordset;
}
