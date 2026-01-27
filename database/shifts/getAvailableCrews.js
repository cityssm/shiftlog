import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getAvailableCrews(shiftDateString) {
    const pool = await getShiftLogConnectionPool();
    const instance = getConfigProperty('application.instance');
    const result = await pool
        .request()
        .input('instance', instance)
        .input('shiftDateString', shiftDateString)
        .query(/* sql */ `
      SELECT
        c.crewId,
        c.crewName
      FROM
        ShiftLog.Crews c
      WHERE
        c.instance = @instance
        AND c.recordDelete_dateTime IS NULL
        AND c.crewId NOT IN (
          SELECT
            sc.crewId
          FROM
            ShiftLog.ShiftCrews sc
            INNER JOIN ShiftLog.Shifts s ON sc.shiftId = s.shiftId
          WHERE
            s.instance = @instance
            AND s.recordDelete_dateTime IS NULL
            AND s.shiftDate = @shiftDateString
        )
      ORDER BY
        c.crewName
    `);
    return result.recordset;
}
