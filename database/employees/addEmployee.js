import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
async function insertNewEmployee(employeeNumber, firstName, lastName, user) {
    const currentDate = new Date();
    try {
        const pool = await getShiftLogConnectionPool();
        await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('employeeNumber', employeeNumber)
            .input('firstName', firstName)
            .input('lastName', lastName)
            .input('recordCreate_userName', user.userName)
            .input('recordCreate_dateTime', currentDate)
            .input('recordUpdate_userName', user.userName)
            .input('recordUpdate_dateTime', currentDate)
            .query(`
        INSERT INTO
          ShiftLog.Employees (
            instance,
            employeeNumber,
            firstName,
            lastName,
            recordCreate_userName,
            recordCreate_dateTime,
            recordUpdate_userName,
            recordUpdate_dateTime
          )
        VALUES
          (
            @instance,
            @employeeNumber,
            @firstName,
            @lastName,
            @recordCreate_userName,
            @recordCreate_dateTime,
            @recordUpdate_userName,
            @recordUpdate_dateTime
          )
      `);
        return true;
    }
    catch {
        return false;
    }
}
async function restoreDeletedEmployee(employeeNumber, firstName, lastName, user) {
    const currentDate = new Date();
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('employeeNumber', employeeNumber)
        .input('firstName', firstName)
        .input('lastName', lastName)
        .input('recordUpdate_userName', user.userName)
        .input('recordUpdate_dateTime', currentDate)
        .query(`
      UPDATE ShiftLog.Employees
      SET
        firstName = @firstName,
        lastName = @lastName,
        recordSync_isSynced = 0,
        recordUpdate_userName = @recordUpdate_userName,
        recordUpdate_dateTime = @recordUpdate_dateTime,
        recordDelete_userName = NULL,
        recordDelete_dateTime = NULL
      WHERE
        instance = @instance
        AND employeeNumber = @employeeNumber
    `);
    return result.rowsAffected.length > 0;
}
export default async function addEmployee(employeeNumber, firstName, lastName, user) {
    const pool = await getShiftLogConnectionPool();
    const recordDeleteResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('employeeNumber', employeeNumber)
        .query(`
      SELECT
        recordDelete_dateTime
      FROM
        ShiftLog.Employees
      WHERE
        instance = @instance
        AND employeeNumber = @employeeNumber
    `);
    let success = false;
    if (recordDeleteResult.recordset.length === 0) {
        success = await insertNewEmployee(employeeNumber, firstName, lastName, user);
    }
    else if (recordDeleteResult.recordset[0].recordDelete_dateTime !== null) {
        success = await restoreDeletedEmployee(employeeNumber, firstName, lastName, user);
    }
    return success;
}
