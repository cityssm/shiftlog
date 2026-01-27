import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getAvailableEquipment(shiftDateString) {
    const pool = await getShiftLogConnectionPool();
    const instance = getConfigProperty('application.instance');
    const result = await pool
        .request()
        .input('instance', instance)
        .input('shiftDateString', shiftDateString)
        .query(/* sql */ `
      SELECT
        eq.equipmentNumber,
        eq.equipmentName
      FROM
        ShiftLog.Equipment eq
      WHERE
        eq.instance = @instance
        AND eq.recordDelete_dateTime IS NULL
        AND eq.equipmentNumber NOT IN (
          SELECT
            seq.equipmentNumber
          FROM
            ShiftLog.ShiftEquipment seq
            INNER JOIN ShiftLog.Shifts s ON seq.shiftId = s.shiftId
          WHERE
            s.instance = @instance
            AND s.recordDelete_dateTime IS NULL
            AND s.shiftDate = @shiftDateString
        )
      ORDER BY
        eq.equipmentName
    `);
    return result.recordset;
}
