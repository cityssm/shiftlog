import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function updateEmployee(employeeFields, user) {
    const currentDate = new Date();
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    const result = await pool
        .request()
        .input('employeeNumber', employeeFields.employeeNumber)
        .input('firstName', employeeFields.firstName)
        .input('lastName', employeeFields.lastName)
        .input('userName', employeeFields.userName ?? undefined)
        .input('isSupervisor', employeeFields.isSupervisor ?? false)
        .input('recordSync_isSynced', employeeFields.recordSync_isSynced ?? false)
        .input('phoneNumber', employeeFields.phoneNumber ?? undefined)
        .input('phoneNumberAlternate', employeeFields.phoneNumberAlternate ?? undefined)
        .input('emailAddress', employeeFields.emailAddress ?? undefined)
        .input('userGroupId', employeeFields.userGroupId ?? undefined)
        .input('recordUpdate_userName', user.userName)
        .input('recordUpdate_dateTime', currentDate).query(/* sql */ `
      update ShiftLog.Employees
        set firstName = @firstName,
        lastName = @lastName,
        userName = @userName,
        isSupervisor = @isSupervisor,
        recordSync_isSynced = @recordSync_isSynced,
        phoneNumber = @phoneNumber,
        phoneNumberAlternate = @phoneNumberAlternate,
        emailAddress = @emailAddress,
        userGroupId = @userGroupId,
        recordUpdate_userName = @recordUpdate_userName,
        recordUpdate_dateTime = @recordUpdate_dateTime
      where employeeNumber = @employeeNumber
        and recordDelete_dateTime is null
    `);
    return result.rowsAffected[0] > 0;
}
