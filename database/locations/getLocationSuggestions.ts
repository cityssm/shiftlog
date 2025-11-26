import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { Location } from '../../types/record.types.js'

export default async function getLocationSuggestions(
  searchString: string,
  user?: User
): Promise<Location[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('searchString', searchString)
    .input('userName', user?.userName).query<Location>(/* sql */ `
      SELECT
        locationId, locationName, address1, address2, cityProvince, latitude, longitude
      FROM ShiftLog.Locations
      WHERE instance = @instance and recordDelete_dateTime IS NULL
        AND (locationName LIKE '%' + @searchString + '%' or address1 LIKE '%' + @searchString + '%')
        ${
          user === undefined
            ? ''
            : `
              AND (
                userGroupId IS NULL OR userGroupId IN (
                  SELECT userGroupId
                  FROM ShiftLog.UserGroupMembers
                  WHERE userName = @userName
                )
              )
            `
        }
      ORDER BY locationName
    `)

  return result.recordset
}
