import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateEmployee(employeeFields, user) {
    const currentDate = new Date();
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('employeeNumber', employeeFields.employeeNumber)
        .input('firstName', employeeFields.firstName)
        .input('lastName', employeeFields.lastName)
        .input('userName', employeeFields.userName ?? undefined)
        .input('isSupervisor', employeeFields.isSupervisor ?? false)
        .input('phoneNumber', employeeFields.phoneNumber ?? undefined)
        .input('phoneNumberAlternate', employeeFields.phoneNumberAlternate ?? undefined)
        .input('emailAddress', employeeFields.emailAddress ?? undefined)
        .input('userGroupId', employeeFields.userGroupId ?? undefined)
        .input('recordSync_isSynced', employeeFields.recordSync_isSynced ?? false)
        .input('recordUpdate_userName', user.userName)
        .input('recordUpdate_dateTime', currentDate).query(/* sql */ `
      update ShiftLog.Employees
        set firstName = @firstName,
        lastName = @lastName,
        userName = @userName,
        isSupervisor = @isSupervisor,
        phoneNumber = @phoneNumber,
        phoneNumberAlternate = @phoneNumberAlternate,
        emailAddress = @emailAddress,
        userGroupId = @userGroupId,
        recordSync_isSynced = @recordSync_isSynced,
        recordUpdate_userName = @recordUpdate_userName,
        recordUpdate_dateTime = @recordUpdate_dateTime
      where instance = @instance
        and employeeNumber = @employeeNumber
        and recordDelete_dateTime is null
    `);
    return result.rowsAffected[0] > 0;
}
