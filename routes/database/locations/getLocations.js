import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getLocations() {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .query(/* sql */ `
      SELECT
        locationId,
        latitude,
        longitude,
        address1,
        address2,
        cityProvince,
        recordSync_isSynced,
        recordSync_source,
        recordSync_dateTime,
        recordCreate_userName,
        recordCreate_dateTime,
        recordUpdate_userName,
        recordUpdate_dateTime
      FROM
        ShiftLog.Locations
      WHERE
        instance = @instance
        AND recordDelete_dateTime IS NULL
      ORDER BY
        address1
    `);
    return result.recordset;
}
