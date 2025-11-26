import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteEquipment(
  equipmentNumber: string,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  try {
    const pool = await getShiftLogConnectionPool()

    const result = await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('equipmentNumber', equipmentNumber)
      .input('recordDelete_userName', user.userName)
      .input('recordDelete_dateTime', currentDate).query(/* sql */ `
        update ShiftLog.Equipment
        set recordDelete_userName = @recordDelete_userName,
          recordDelete_dateTime = @recordDelete_dateTime
        where instance = @instance
          and equipmentNumber = @equipmentNumber
          and recordDelete_dateTime is null
      `)

    return result.rowsAffected[0] > 0
  } catch {
    return false
  }
}
