import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getWorkOrderType(workOrderTypeId, user) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', user?.userName ?? '')
        .input('workOrderTypeId', workOrderTypeId).query(/* sql */ `
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
        and wt.workOrderTypeId = @workOrderTypeId
        and wt.recordDelete_dateTime is null
        ${user === undefined
        ? ''
        : /* sql */ `
              and (
                wt.userGroupId is null or wt.userGroupId in (
                  select userGroupId
                  from ShiftLog.UserGroupMembers
                  where userName = @userName
                )
              )
              `}
    `));
    return result.recordset[0];
}
