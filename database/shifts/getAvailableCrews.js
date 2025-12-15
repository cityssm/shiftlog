import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getAvailableCrews(shiftDateString) {
    const pool = await getShiftLogConnectionPool();
    const instance = getConfigProperty('application.instance');
    const result = await pool
        .request()
        .input('instance', instance)
        .input('shiftDateString', shiftDateString).query(`
      select c.crewId, c.crewName
      from ShiftLog.Crews c
      where c.instance = @instance
        and c.recordDelete_dateTime is null
        and c.crewId not in (
          select sc.crewId
          from ShiftLog.ShiftCrews sc
          inner join ShiftLog.Shifts s on sc.shiftId = s.shiftId
          where s.instance = @instance
            and s.recordDelete_dateTime is null
            and s.shiftDate = @shiftDateString
        )
      order by c.crewName
    `);
    return result.recordset;
}
