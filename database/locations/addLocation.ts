import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

interface AddLocationForm {
  address1: string
  address2: string
  cityProvince: string
  
  latitude?: number | null
  longitude?: number | null
}

export default async function addLocation(
  locationFields: AddLocationForm,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  try {
    const pool = await getShiftLogConnectionPool()

    await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('address1', locationFields.address1)
      .input('address2', locationFields.address2)
      .input('cityProvince', locationFields.cityProvince)
      .input('latitude', locationFields.latitude)
      .input('longitude', locationFields.longitude)
      .input('recordCreate_userName', user.userName)
      .input('recordCreate_dateTime', currentDate)
      .input('recordUpdate_userName', user.userName)
      .input('recordUpdate_dateTime', currentDate).query(/* sql */ `
        INSERT INTO ShiftLog.Locations (
          instance, address1, address2, cityProvince,
          latitude, longitude,
          recordCreate_userName, recordCreate_dateTime,
          recordUpdate_userName, recordUpdate_dateTime
        ) VALUES (
          @instance, @address1, @address2, @cityProvince,
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
