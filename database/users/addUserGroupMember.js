import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function addUserGroupMember(userGroupId, userName) {
    try {
        const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
        await pool
            .request()
            .input('userGroupId', userGroupId)
            .input('userName', userName)
            .query(/* sql */ `
        insert into ShiftLog.UserGroupMembers (userGroupId, userName)
        values (@userGroupId, @userName)
      `);
        return true;
    }
    catch {
        return false;
    }
}
