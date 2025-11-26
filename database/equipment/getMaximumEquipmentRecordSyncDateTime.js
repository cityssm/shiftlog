import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getMaximumEquipmentRecordSyncDateTime() {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .query(/* sql */ `select max(recordSync_dateTime) as maxRecordSyncDateTime
      from ShiftLog.Equipment
      where instance = @instance
        and recordSync_isSynced = 1`));
    if (result.recordset.length === 0 ||
        result.recordset[0].maxRecordSyncDateTime === null) {
        return undefined;
    }
    return result.recordset[0].maxRecordSyncDateTime;
}
