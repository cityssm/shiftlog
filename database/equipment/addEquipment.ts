import mssqlPool, { type mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function addEquipment(
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
      .input('userGroupId', userGroupId ?? null)
      .input('recordCreate_userName', user.userName)
      .input('recordCreate_dateTime', currentDate)
      .input('recordUpdate_userName', user.userName)
      .input('recordUpdate_dateTime', currentDate)
      .query(/* sql */ `
        insert into ShiftLog.Equipment (
          equipmentNumber, equipmentName, equipmentDescription,
          equipmentTypeDataListItemId, userGroupId,
          recordCreate_userName, recordCreate_dateTime,
          recordUpdate_userName, recordUpdate_dateTime
        )
        values (
          @equipmentNumber, @equipmentName, @equipmentDescription,
          @equipmentTypeDataListItemId, @userGroupId,
          @recordCreate_userName, @recordCreate_dateTime,
          @recordUpdate_userName, @recordUpdate_dateTime
        )
      `)

    return result.rowsAffected[0] > 0
  } catch {
    return false
  }
}
