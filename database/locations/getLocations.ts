import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function getLocations(): Promise<Location[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .query<Location>(/* sql */ `
    SELECT locationId, locationName, latitude, longitude,
           address1, address2, cityProvince,
           recordCreate_userName, recordCreate_dateTime,
           recordUpdate_userName, recordUpdate_dateTime
    FROM ShiftLog.Locations
    WHERE instance = @instance and recordDelete_dateTime IS NULL
    ORDER BY locationName
  `)

  return result.recordset as Location[]
}
