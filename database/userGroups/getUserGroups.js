import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function getUserGroups() {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    const result = (await pool.request().query(/* sql */ `
    select ug.userGroupId, ug.userGroupName,
      ug.recordCreate_userName, ug.recordCreate_dateTime,
      ug.recordUpdate_userName, ug.recordUpdate_dateTime,
      count(ugm.userName) as memberCount
    from ShiftLog.UserGroups ug
    left join ShiftLog.UserGroupMembers ugm on ug.userGroupId = ugm.userGroupId
    where ug.recordDelete_dateTime is null
    group by ug.userGroupId, ug.userGroupName,
      ug.recordCreate_userName, ug.recordCreate_dateTime,
      ug.recordUpdate_userName, ug.recordUpdate_dateTime
    order by ug.userGroupName
  `));
    return result.recordset;
}
