import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function addShiftEmployee(form) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    try {
        await pool
            .request()
            .input('shiftId', form.shiftId)
            .input('employeeNumber', form.employeeNumber)
            .input('crewId', form.crewId ?? null)
            .input('shiftEmployeeNote', form.shiftEmployeeNote ?? '').query(/* sql */ `
        insert into ShiftLog.ShiftEmployees (shiftId, employeeNumber, crewId, shiftEmployeeNote)
        values (@shiftId, @employeeNumber, @crewId, @shiftEmployeeNote)
      `);
        return true;
    }
    catch {
        return false;
    }
}
