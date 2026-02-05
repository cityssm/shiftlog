import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { Location } from '../../types/record.types.js'

export default async function getLocationByAddress1(
  address1: string
): Promise<Location | undefined> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('address1', address1)
    .query<Location>(/* sql */ `
      SELECT
        locationId,
        address1,
        address2,
        cityProvince,
        latitude,
        longitude,
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
        AND address1 = @address1
    `)

  return result.recordset[0]
}
