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
            .input('recordUpdate_dateTime', currentDate).query(/* sql */ `
        insert into ShiftLog.Employees (
          instance, employeeNumber, firstName, lastName,
          recordCreate_userName, recordCreate_dateTime,
          recordUpdate_userName, recordUpdate_dateTime
        ) values (
          @instance, @employeeNumber, @firstName, @lastName,
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
        .input('recordUpdate_dateTime', currentDate).query(/* sql */ `
      update ShiftLog.Employees
        set firstName = @firstName,
        lastName = @lastName,
        recordSync_isSynced = 0,
        recordUpdate_userName = @recordUpdate_userName,
        recordUpdate_dateTime = @recordUpdate_dateTime,
        recordDelete_userName = null,
        recordDelete_dateTime = null
      where instance = @instance
        and employeeNumber = @employeeNumber
    `);
    return result.rowsAffected.length > 0;
}
export default async function addEmployee(employeeNumber, firstName, lastName, user) {
    const pool = await getShiftLogConnectionPool();
    // Check if an employee with the same number already exists
    const recordDeleteResult = (await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('employeeNumber', employeeNumber).query(/* sql */ `
      select recordDelete_dateTime
      from ShiftLog.Employees
      where instance = @instance
        and employeeNumber = @employeeNumber
    `));
    let success = false;
    if (recordDeleteResult.recordset.length === 0) {
        success = await insertNewEmployee(employeeNumber, firstName, lastName, user);
    }
    else if (recordDeleteResult.recordset[0].recordDelete_dateTime !== null) {
        success = await restoreDeletedEmployee(employeeNumber, firstName, lastName, user);
    }
    return success;
}
