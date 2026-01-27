import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function addUserGroupMember(userGroupId, userName) {
    try {
        const pool = await getShiftLogConnectionPool();
        await pool
            .request()
            .input('userGroupId', userGroupId)
            .input('instance', getConfigProperty('application.instance'))
            .input('userName', userName)
            .query(/* sql */ `
        INSERT INTO
          ShiftLog.UserGroupMembers (userGroupId, instance, userName)
        VALUES
          (@userGroupId, @instance, @userName)
      `);
        return true;
    }
    catch {
        return false;
    }
}
