import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export async function getAvailableEquipment(shiftDateString) {
    const pool = await getShiftLogConnectionPool();
    const instance = getConfigProperty('application.instance');
    const result = await pool
        .request()
        .input('instance', instance)
        .input('shiftDateString', shiftDateString).query(`
      select eq.equipmentNumber, eq.equipmentName
      from ShiftLog.Equipment eq
      where eq.instance = @instance
        and eq.recordDelete_dateTime is null
        and eq.equipmentNumber not in (
          select seq.equipmentNumber
          from ShiftLog.ShiftEquipment seq
          inner join ShiftLog.Shifts s on seq.shiftId = s.shiftId
          where s.instance = @instance
            and s.recordDelete_dateTime is null
            and s.shiftDate = @shiftDateString
            and seq.recordDelete_dateTime is null
        )
      order by eq.equipmentName
    `);
    return result.recordset;
}
export default getAvailableEquipment;
