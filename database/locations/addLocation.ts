import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function addLocation(
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

    await pool
      .request()
      .input('locationName', locationName)
      .input('address1', address1)
      .input('address2', address2)
      .input('cityProvince', cityProvince)
      .input('latitude', latitude)
      .input('longitude', longitude)
      .input('recordCreate_userName', user.userName)
      .input('recordCreate_dateTime', currentDate)
      .input('recordUpdate_userName', user.userName)
      .input('recordUpdate_dateTime', currentDate).query(/* sql */ `
        INSERT INTO ShiftLog.Locations (
          locationName, address1, address2, cityProvince,
          latitude, longitude,
          recordCreate_userName, recordCreate_dateTime,
          recordUpdate_userName, recordUpdate_dateTime
        ) VALUES (
          @locationName, @address1, @address2, @cityProvince,
          @latitude, @longitude,
          @recordCreate_userName, @recordCreate_dateTime,
          @recordUpdate_userName, @recordUpdate_dateTime
        )
      `)

    return true
  } catch {
    return false
  }
}
