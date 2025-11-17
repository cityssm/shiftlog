import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function addShiftEmployee(form) {
    const pool = await getShiftLogConnectionPool();
    try {
        await pool
            .request()
            .input('shiftId', form.shiftId)
            .input('employeeNumber', form.employeeNumber)
            .input('crewId', (form.crewId ?? '') === '' ? null : form.crewId)
            .input('shiftEmployeeNote', form.shiftEmployeeNote ?? '').query(/* sql */ `
        insert into ShiftLog.ShiftEmployees (shiftId, employeeNumber, crewId, shiftEmployeeNote)
        values (@shiftId, @employeeNumber, @crewId, @shiftEmployeeNote)
      `);
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
}
