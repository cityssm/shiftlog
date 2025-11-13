import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function updateUserGroup(userGroupId, userGroupName, user) {
    const currentDate = new Date();
    try {
        const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
        const result = await pool
            .request()
            .input('userGroupId', userGroupId)
            .input('userGroupName', userGroupName)
            .input('recordUpdate_userName', user.userName)
            .input('recordUpdate_dateTime', currentDate)
            .query(/* sql */ `
        update ShiftLog.UserGroups
        set userGroupName = @userGroupName,
          recordUpdate_userName = @recordUpdate_userName,
          recordUpdate_dateTime = @recordUpdate_dateTime
        where userGroupId = @userGroupId
          and recordDelete_dateTime is null
      `);
        return result.rowsAffected[0] > 0;
    }
    catch {
        return false;
    }
}
