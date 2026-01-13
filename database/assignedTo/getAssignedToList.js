import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getAssignedToList(userName) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', userName).query(/* sql */ `
      select
        a.assignedToId,
        a.assignedToName,
        a.orderNumber,
        a.userGroupId,
        ug.userGroupName,
        a.recordCreate_userName,
        a.recordCreate_dateTime,
        a.recordUpdate_userName,
        a.recordUpdate_dateTime
      from ShiftLog.AssignedTo a
      left join ShiftLog.UserGroups ug on a.userGroupId = ug.userGroupId
      where a.instance = @instance
        and a.recordDelete_dateTime is null
        ${userName === undefined
        ? ''
        : `
                and (a.userGroupId is null or a.userGroupId in (
                  select userGroupId
                  from ShiftLog.UserGroupMembers
                  where userName = @userName
                ))
              `}
      order by a.orderNumber, a.assignedToName
    `));
    return result.recordset;
}
