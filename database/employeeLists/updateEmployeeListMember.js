import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function updateEmployeeListMember(employeeListId, employeeNumber, seniorityDate, seniorityOrderNumber) {
    try {
        const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
        const result = await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('employeeListId', employeeListId)
            .input('employeeNumber', employeeNumber)
            .input('seniorityDate', seniorityDate ?? null)
            .input('seniorityOrderNumber', seniorityOrderNumber)
            .query(/* sql */ `
        UPDATE ShiftLog.EmployeeListMembers
        SET
          seniorityDate = @seniorityDate,
          seniorityOrderNumber = @seniorityOrderNumber
        WHERE
          employeeListId = @employeeListId
          AND employeeNumber = @employeeNumber
      `);
        return result.rowsAffected[0] > 0;
    }
    catch {
        return false;
    }
}
