import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getLocationByAddress1(address1) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('address1', address1).query(/* sql */ `
      select locationId,
        address1,
        address2,
        cityProvince,
        latitude,
        longitude,
        userGroupId,
        recordSync_isSynced,
        recordSync_source,
        recordSync_dateTime,
        recordCreate_userName,
        recordCreate_dateTime,
        recordUpdate_userName,
        recordUpdate_dateTime
      from ShiftLog.Locations
      where instance = @instance and address1 = @address1
    `);
    return result.recordset[0];
}
