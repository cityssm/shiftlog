import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function deleteShiftEmployee(form) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    try {
        await pool
            .request()
            .input('shiftId', form.shiftId)
            .input('employeeNumber', form.employeeNumber).query(/* sql */ `
        delete from ShiftLog.ShiftEmployees
        where shiftId = @shiftId and employeeNumber = @employeeNumber
      `);
        return true;
    }
    catch {
        return false;
    }
}
