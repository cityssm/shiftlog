import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function addEmployeeListMember(employeeListId, employeeNumber, seniorityDate, seniorityOrderNumber) {
    try {
        const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
        await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('employeeListId', employeeListId)
            .input('employeeNumber', employeeNumber)
            .input('seniorityDate', seniorityDate ?? null)
            .input('seniorityOrderNumber', seniorityOrderNumber).query(/* sql */ `
        insert into ShiftLog.EmployeeListMembers (
          employeeListId, instance, employeeNumber,
          seniorityDate, seniorityOrderNumber
        )
        values (
          @employeeListId, @instance, @employeeNumber,
          @seniorityDate, @seniorityOrderNumber
        )
      `);
        return true;
    }
    catch {
        return false;
    }
}
