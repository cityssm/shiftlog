import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function updateLocation(
  locationId: number,
  locationName: string,
  address1: string,
  address2: string,
  cityProvince: string,
  latitude: number | null,
  longitude: number | null,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  try {
    const pool = await getShiftLogConnectionPool()

    const result = await pool
      .request()
      .input('locationId', locationId)
      .input('locationName', locationName)
      .input('address1', address1)
      .input('address2', address2)
      .input('cityProvince', cityProvince)
      .input('latitude', latitude)
      .input('longitude', longitude)
      .input('recordUpdate_userName', user.userName)
      .input('recordUpdate_dateTime', currentDate).query(/* sql */ `
        UPDATE ShiftLog.Locations
        SET locationName = @locationName,
            address1 = @address1,
            address2 = @address2,
            cityProvince = @cityProvince,
            latitude = @latitude,
            longitude = @longitude,
            recordUpdate_userName = @recordUpdate_userName,
            recordUpdate_dateTime = @recordUpdate_dateTime
        WHERE locationId = @locationId
          AND recordDelete_dateTime IS NULL
      `)

    return result.rowsAffected[0] > 0
  } catch {
    return false
  }
}
