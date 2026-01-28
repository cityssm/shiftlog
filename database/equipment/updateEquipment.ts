import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function updateEquipment(
  equipmentFields: {
    equipmentNumber: string
    equipmentName: string
    equipmentDescription: string
    equipmentTypeDataListItemId: number
    employeeListId: number | undefined
    recordSync_isSynced?: boolean
    userGroupId: number | undefined
  },
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  try {
    const pool = await getShiftLogConnectionPool()

    const result = await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('equipmentNumber', equipmentFields.equipmentNumber)
      .input('equipmentName', equipmentFields.equipmentName)
      .input('equipmentDescription', equipmentFields.equipmentDescription)
      .input(
        'equipmentTypeDataListItemId',
        equipmentFields.equipmentTypeDataListItemId
      )
      .input('employeeListId', equipmentFields.employeeListId ?? undefined)
      .input('userGroupId', equipmentFields.userGroupId ?? undefined)
      .input(
        'recordSync_isSynced',
        equipmentFields.recordSync_isSynced ?? false
      )
      .input('recordUpdate_userName', user.userName)
      .input('recordUpdate_dateTime', currentDate)
      .query(/* sql */ `
        UPDATE ShiftLog.Equipment
        SET
          equipmentName = @equipmentName,
          equipmentDescription = @equipmentDescription,
          equipmentTypeDataListItemId = @equipmentTypeDataListItemId,
          employeeListId = @employeeListId,
          userGroupId = @userGroupId,
          recordSync_isSynced = @recordSync_isSynced,
          recordUpdate_userName = @recordUpdate_userName,
          recordUpdate_dateTime = @recordUpdate_dateTime
        WHERE
          instance = @instance
          AND equipmentNumber = @equipmentNumber
          AND recordDelete_dateTime IS NULL
      `)

    return result.rowsAffected[0] > 0
  } catch {
    return false
  }
}
