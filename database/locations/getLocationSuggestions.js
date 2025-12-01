import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getLocationSuggestions(searchString, user) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('searchString', searchString)
        .input('userName', user?.userName).query(/* sql */ `
      SELECT
        locationId, address1, address2, cityProvince, latitude, longitude
      FROM ShiftLog.Locations
      WHERE instance = @instance and recordDelete_dateTime IS NULL
        AND address1 LIKE '%' + @searchString + '%'
        ${user === undefined
        ? ''
        : `
              AND (
                userGroupId IS NULL OR userGroupId IN (
                  SELECT userGroupId
                  FROM ShiftLog.UserGroupMembers
                  WHERE userName = @userName
                )
              )
            `}
      ORDER BY address1
    `);
    return result.recordset;
}
