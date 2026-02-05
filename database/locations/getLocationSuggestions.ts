import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { Location } from '../../types/record.types.js'

export default async function getLocationSuggestions(
  searchString: string
): Promise<Location[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('searchString', searchString)
    .query<Location>(/* sql */ `
      SELECT
        locationId,
        address1,
        address2,
        cityProvince,
        latitude,
        longitude
      FROM
        ShiftLog.Locations
      WHERE
        instance = @instance
        AND recordDelete_dateTime IS NULL
        AND address1 LIKE '%' + @searchString + '%'
      ORDER BY
        address1
    `)

  return result.recordset
}
