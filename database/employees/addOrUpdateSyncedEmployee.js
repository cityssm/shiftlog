import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
import { usePartialOrCurrentValue } from '../../helpers/sync.helpers.js';
import getEmployee from './getEmployee.js';
const debug = Debug(`${DEBUG_NAMESPACE}:database:employees:addOrUpdateSyncedEmployee`);
async function addSyncedEmployee(partialEmployee, syncUserName) {
    const pool = await getShiftLogConnectionPool();
    await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('employeeNumber', partialEmployee.employeeNumber)
        .input('firstName', partialEmployee.firstName ?? '')
        .input('lastName', partialEmployee.lastName ?? '')
        .input('userName', partialEmployee.userName ?? '')
        .input('isSupervisor', partialEmployee.isSupervisor ?? false)
        .input('phoneNumber', partialEmployee.phoneNumber ?? '')
        .input('phoneNumberAlternate', partialEmployee.phoneNumberAlternate ?? '')
        .input('emailAddress', partialEmployee.emailAddress ?? '')
        .input('userGroupId', partialEmployee.userGroupId ?? undefined)
        .input('recordSync_isSynced', true)
        .input('recordSync_source', partialEmployee.recordSync_source ?? undefined)
        .input('recordSync_dateTime', partialEmployee.recordSync_dateTime ?? new Date())
        .input('recordCreate_userName', syncUserName)
        .input('recordCreate_dateTime', new Date())
        .input('recordUpdate_userName', syncUserName)
        .input('recordUpdate_dateTime', new Date()).query(/* sql */ `
      insert into ShiftLog.Employees (
        instance, employeeNumber, firstName, lastName,
        userName, isSupervisor,
        phoneNumber, phoneNumberAlternate, emailAddress,
        userGroupId,
        recordSync_isSynced, recordSync_source, recordSync_dateTime,
        recordCreate_userName, recordCreate_dateTime,
        recordUpdate_userName, recordUpdate_dateTime
      ) values (
        @instance, @employeeNumber, @firstName, @lastName,
        @userName, @isSupervisor,
        @phoneNumber, @phoneNumberAlternate, @emailAddress,
        @userGroupId,
        @recordSync_isSynced, @recordSync_source, @recordSync_dateTime,
        @recordCreate_userName, @recordCreate_dateTime,
        @recordUpdate_userName, @recordUpdate_dateTime
      )
    `);
}
async function updateSyncedEmployee(currentEmployee, partialEmployee, syncUserName) {
    const updateEmployee = {
        employeeNumber: currentEmployee.employeeNumber,
        firstName: usePartialOrCurrentValue(partialEmployee.firstName, currentEmployee.firstName) ?? '',
        lastName: usePartialOrCurrentValue(partialEmployee.lastName, currentEmployee.lastName) ?? '',
        userName: usePartialOrCurrentValue(partialEmployee.userName, currentEmployee.userName),
        isSupervisor: usePartialOrCurrentValue(partialEmployee.isSupervisor, currentEmployee.isSupervisor, 'current') ?? false,
        phoneNumber: usePartialOrCurrentValue(partialEmployee.phoneNumber, currentEmployee.phoneNumber, 'current') ?? '',
        phoneNumberAlternate: usePartialOrCurrentValue(partialEmployee.phoneNumberAlternate, currentEmployee.phoneNumberAlternate, 'current') ?? '',
        emailAddress: usePartialOrCurrentValue(partialEmployee.emailAddress, currentEmployee.emailAddress) ?? '',
        userGroupId: usePartialOrCurrentValue(partialEmployee.userGroupId, currentEmployee.userGroupId),
        recordSync_isSynced: true,
        recordSync_source: partialEmployee.recordSync_source,
        recordSync_dateTime: partialEmployee.recordSync_dateTime ?? new Date()
    };
    const pool = await getShiftLogConnectionPool();
    await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('employeeNumber', updateEmployee.employeeNumber)
        .input('firstName', updateEmployee.firstName)
        .input('lastName', updateEmployee.lastName)
        .input('userName', updateEmployee.userName)
        .input('isSupervisor', updateEmployee.isSupervisor)
        .input('phoneNumber', updateEmployee.phoneNumber)
        .input('phoneNumberAlternate', updateEmployee.phoneNumberAlternate)
        .input('emailAddress', updateEmployee.emailAddress)
        .input('userGroupId', updateEmployee.userGroupId)
        .input('recordSync_isSynced', updateEmployee.recordSync_isSynced)
        .input('recordSync_source', updateEmployee.recordSync_source)
        .input('recordSync_dateTime', updateEmployee.recordSync_dateTime)
        .input('recordUpdate_userName', syncUserName)
        .input('recordUpdate_dateTime', new Date()).query(/* sql */ `
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
        recordSync_source = @recordSync_source,
        recordSync_dateTime = @recordSync_dateTime,
        recordUpdate_userName = @recordUpdate_userName,
        recordUpdate_dateTime = @recordUpdate_dateTime,
        recordDelete_userName = null,
        recordDelete_dateTime = null
      where instance = @instance
        and employeeNumber = @employeeNumber
    `);
}
export default async function addOrUpdateSyncedEmployee(partialEmployee, syncUserName) {
    const currentEmployee = await getEmployee(partialEmployee.employeeNumber ?? '', true);
    if (currentEmployee === undefined) {
        debug('Adding new synced employee', partialEmployee.employeeNumber);
        await addSyncedEmployee(partialEmployee, syncUserName);
    }
    else if (currentEmployee.recordSync_isSynced) {
        debug('Updating synced employee', partialEmployee.employeeNumber);
        await updateSyncedEmployee(currentEmployee, partialEmployee, syncUserName);
    }
    else {
        debug('Skipping employee not synced', partialEmployee.employeeNumber);
        return false;
    }
    return true;
}
