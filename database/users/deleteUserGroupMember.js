import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteUserGroupMember(userGroupId, userName) {
    try {
        const pool = await getShiftLogConnectionPool();
        const result = await pool
            .request()
            .input('userGroupId', userGroupId)
            .input('userName', userName)
            .input('instance', getConfigProperty('application.instance'))
            .query(/* sql */ `
        delete from ShiftLog.UserGroupMembers
        where userGroupId = @userGroupId
          and userName = @userName
          and instance = @instance
      `);
        return result.rowsAffected[0] > 0;
    }
    catch {
        return false;
    }
}
