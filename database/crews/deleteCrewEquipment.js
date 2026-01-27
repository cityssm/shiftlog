import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteCrewEquipment(crewId, equipmentNumber) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('crewId', crewId)
        .input('equipmentNumber', equipmentNumber)
        .query(/* sql */ `
      DELETE FROM ShiftLog.CrewEquipment
      WHERE
        crewId = @crewId
        AND equipmentNumber = @equipmentNumber
    `);
    return result.rowsAffected[0] > 0;
}
