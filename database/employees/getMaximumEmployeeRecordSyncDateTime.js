import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getMaximumEmployeeRecordSyncDateTime() {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool.request()
        .query(/* sql */ `select max(recordSync_dateTime) as maxRecordSyncDateTime
      from ShiftLog.Employees
      where recordSync_isSynced = 1`));
    if (result.recordset.length === 0 ||
        !result.recordset[0].maxRecordSyncDateTime) {
        return undefined;
    }
    return result.recordset[0].maxRecordSyncDateTime;
}
