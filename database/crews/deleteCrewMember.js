import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteCrewMember(crewId, employeeNumber) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('crewId', crewId)
        .input('employeeNumber', employeeNumber).query(/* sql */ `
      delete from ShiftLog.CrewMembers
      where crewId = @crewId
        and employeeNumber = @employeeNumber
    `);
    return result.rowsAffected[0] > 0;
}
