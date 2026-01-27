import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateLocation(updateLocationForm, user) {
    const currentDate = new Date();
    try {
        const pool = await getShiftLogConnectionPool();
        const result = await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('locationId', updateLocationForm.locationId)
            .input('address1', updateLocationForm.address1)
            .input('address2', updateLocationForm.address2)
            .input('cityProvince', updateLocationForm.cityProvince)
            .input('latitude', updateLocationForm.latitude)
            .input('longitude', updateLocationForm.longitude)
            .input('recordUpdate_userName', user.userName)
            .input('recordUpdate_dateTime', currentDate)
            .query(/* sql */ `
        UPDATE ShiftLog.Locations
        SET
          address1 = @address1,
          address2 = @address2,
          cityProvince = @cityProvince,
          latitude = @latitude,
          longitude = @longitude,
          recordUpdate_userName = @recordUpdate_userName,
          recordUpdate_dateTime = @recordUpdate_dateTime
        WHERE
          locationId = @locationId
          AND instance = @instance
          AND recordDelete_dateTime IS NULL
      `);
        return result.rowsAffected[0] > 0;
    }
    catch {
        return false;
    }
}
