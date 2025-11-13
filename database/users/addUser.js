import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
async function insertNewUser(newUserName, user) {
    const currentDate = new Date();
    try {
        const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
        await pool
            .request()
            .input('userName', newUserName)
            .input('recordCreate_userName', user.userName)
            .input('recordCreate_dateTime', currentDate)
            .input('recordUpdate_userName', user.userName)
            .input('recordUpdate_dateTime', currentDate).query(/* sql */ `
        insert into ShiftLog.Users (
          userName,
          recordCreate_userName, recordCreate_dateTime,
          recordUpdate_userName, recordUpdate_dateTime
        ) values (@userName,
          @recordCreate_userName, @recordCreate_dateTime,
          @recordUpdate_userName, @recordUpdate_dateTime
        )
        `);
        return true;
    }
    catch {
        return false;
    }
}
async function restoreDeletedUser(newUserName, user) {
    const currentDate = new Date();
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    const result = await pool
        .request()
        .input('userName', newUserName)
        .input('recordUpdate_userName', user.userName)
        .input('recordUpdate_dateTime', currentDate).query(/* sql */ `
      update ShiftLog.Users
        set recordUpdate_userName = @recordUpdate_userName,
        recordUpdate_dateTime = @recordUpdate_dateTime,
        recordDelete_userName = null,
        recordDelete_timeMillis = null
      where userName = @userName
      `);
    return result.rowsAffected.length > 0;
}
export default async function addUser(newUserName, user) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    // Check if an user with the same name already exists
    const recordDeleteResult = (await pool
        .request()
        .input('userName', newUserName).query(/* sql */ `
      select recordDelete_dateTime from ShiftLog.Users where userName = @userName
    `));
    let success = false;
    if (recordDeleteResult.recordset.length === 0) {
        success = await insertNewUser(newUserName, user);
    }
    else if (recordDeleteResult.recordset[0].recordDelete_dateTime !== null) {
        success = await restoreDeletedUser(newUserName, user);
    }
    return success;
}
