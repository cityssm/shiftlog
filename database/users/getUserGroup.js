import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getUserGroup(userGroupId) {
    const pool = await getShiftLogConnectionPool();
    const groupResult = (await pool
        .request()
        .input('userGroupId', userGroupId)
        .input('instance', getConfigProperty('application.instance'))
        .query(/* sql */ `
      select userGroupId, userGroupName,
        recordCreate_userName, recordCreate_dateTime,
        recordUpdate_userName, recordUpdate_dateTime
      from ShiftLog.UserGroups
      where userGroupId = @userGroupId
        and instance = @instance
        and recordDelete_dateTime is null
    `));
    if (groupResult.recordset.length === 0) {
        return undefined;
    }
    const userGroup = groupResult.recordset[0];
    // Get members
    const membersResult = await pool
        .request()
        .input('userGroupId', userGroupId)
        .input('instance', getConfigProperty('application.instance'))
        .query(/* sql */ `
      select userName
      from ShiftLog.UserGroupMembers
      where userGroupId = @userGroupId
        and instance = @instance
      order by userName
    `);
    userGroup.members = membersResult.recordset.map((row) => row.userName);
    userGroup.memberCount = userGroup.members.length;
    return userGroup;
}
