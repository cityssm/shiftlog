import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function deleteUserGroupMember(userGroupId, userName) {
    try {
        const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
        const result = await pool
            .request()
            .input('userGroupId', userGroupId)
            .input('userName', userName)
            .query(/* sql */ `
        delete from ShiftLog.UserGroupMembers
        where userGroupId = @userGroupId
          and userName = @userName
      `);
        return result.rowsAffected[0] > 0;
    }
    catch {
        return false;
    }
}
