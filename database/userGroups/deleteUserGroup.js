import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function deleteUserGroup(userGroupId, user) {
    const currentDate = new Date();
    try {
        const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
        const result = await pool
            .request()
            .input('userGroupId', userGroupId)
            .input('recordDelete_userName', user.userName)
            .input('recordDelete_dateTime', currentDate)
            .query(/* sql */ `
        update ShiftLog.UserGroups
        set recordDelete_userName = @recordDelete_userName,
          recordDelete_dateTime = @recordDelete_dateTime
        where userGroupId = @userGroupId
          and recordDelete_dateTime is null
      `);
        return result.rowsAffected[0] > 0;
    }
    catch {
        return false;
    }
}
