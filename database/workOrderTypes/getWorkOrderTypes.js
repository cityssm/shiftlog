import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getWorkOrderTypes(user) {
    const pool = await getShiftLogConnectionPool();
    const workOrderTypesResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', user?.userName).query(/* sql */ `
      select
        wt.workOrderTypeId,
        wt.workOrderType,
        wt.workOrderNumberPrefix,
        wt.orderNumber,
        wt.userGroupId,
        ug.userGroupName
      from ShiftLog.WorkOrderTypes wt
      left join ShiftLog.UserGroups ug
        on wt.userGroupId = ug.userGroupId
      where wt.instance = @instance
        and wt.recordDelete_dateTime is null
        ${user === undefined
        ? ''
        : `
                and (wt.userGroupId is null or wt.userGroupId in (
                  select userGroupId
                  from ShiftLog.UserGroupMembers
                  where userName = @userName
                ))
              `}
      order by wt.orderNumber, wt.workOrderType
    `);
    return workOrderTypesResult.recordset;
}
