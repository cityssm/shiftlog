import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function addShiftEmployee(form) {
    const pool = await getShiftLogConnectionPool();
    try {
        await pool
            .request()
            .input('shiftId', form.shiftId)
            .input('instance', getConfigProperty('application.instance'))
            .input('employeeNumber', form.employeeNumber)
            .input('crewId', (form.crewId ?? '') === '' ? undefined : form.crewId)
            .input('shiftEmployeeNote', form.shiftEmployeeNote ?? '')
            .query(/* sql */ `
        insert into ShiftLog.ShiftEmployees (shiftId, instance, employeeNumber, crewId, shiftEmployeeNote)
        values (@shiftId, @instance, @employeeNumber, @crewId, @shiftEmployeeNote)
      `);
        return true;
    }
    catch {
        return false;
    }
}
