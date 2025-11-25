import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getLocations() {
    const pool = await getShiftLogConnectionPool();
    const result = await pool.request().query(/* sql */ `
    SELECT locationId, locationName, latitude, longitude,
           address1, address2, cityProvince,
           recordCreate_userName, recordCreate_dateTime,
           recordUpdate_userName, recordUpdate_dateTime
    FROM ShiftLog.Locations
    WHERE recordDelete_dateTime IS NULL
    ORDER BY locationName
  `);
    return result.recordset;
}
