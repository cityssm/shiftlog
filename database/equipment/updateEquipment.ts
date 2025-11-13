import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

// eslint-disable-next-line @typescript-eslint/max-params
export default async function updateEquipment(
  equipmentNumber: string,
  equipmentName: string,
  equipmentDescription: string,
  equipmentTypeDataListItemId: number,
  userGroupId: number | undefined,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  try {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

    const result = await pool
      .request()
      .input('equipmentNumber', equipmentNumber)
      .input('equipmentName', equipmentName)
      .input('equipmentDescription', equipmentDescription)
      .input('equipmentTypeDataListItemId', equipmentTypeDataListItemId)
      .input('userGroupId', userGroupId ?? undefined)
      .input('recordUpdate_userName', user.userName)
      .input('recordUpdate_dateTime', currentDate)
      .query(/* sql */ `
        update ShiftLog.Equipment
        set equipmentName = @equipmentName,
          equipmentDescription = @equipmentDescription,
          equipmentTypeDataListItemId = @equipmentTypeDataListItemId,
          userGroupId = @userGroupId,
          recordUpdate_userName = @recordUpdate_userName,
          recordUpdate_dateTime = @recordUpdate_dateTime
        where equipmentNumber = @equipmentNumber
          and recordDelete_dateTime is null
      `)

    return result.rowsAffected[0] > 0
  } catch {
    return false
  }
}
