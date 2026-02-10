import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteUserGroup(userGroupId, user) {
    const currentDate = new Date();
    try {
        const pool = await getShiftLogConnectionPool();
        const result = await pool
            .request()
            .input('userGroupId', userGroupId)
            .input('instance', getConfigProperty('application.instance'))
            .input('recordDelete_userName', user.userName)
            .input('recordDelete_dateTime', currentDate)
            .query(/* sql */ `
        UPDATE ShiftLog.UserGroups
        SET
          recordDelete_userName = @recordDelete_userName,
          recordDelete_dateTime = @recordDelete_dateTime
        WHERE
          userGroupId = @userGroupId
          AND instance = @instance
          AND recordDelete_dateTime IS NULL
      `);
        return result.rowsAffected[0] > 0;
    }
    catch {
        return false;
    }
}
