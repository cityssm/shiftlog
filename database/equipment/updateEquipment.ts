import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

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
    const pool = await mssqlPool.connect(
      getConfigProperty('connectors.shiftLog')
    )

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
      .input('recordUpdate_dateTime', currentDate).query(/* sql */ `
        update ShiftLog.Equipment
        set equipmentName = @equipmentName,
          equipmentDescription = @equipmentDescription,
          equipmentTypeDataListItemId = @equipmentTypeDataListItemId,
          employeeListId = @employeeListId,
          userGroupId = @userGroupId,
          recordSync_isSynced = @recordSync_isSynced,
          recordUpdate_userName = @recordUpdate_userName,
          recordUpdate_dateTime = @recordUpdate_dateTime
        where instance = @instance
          and equipmentNumber = @equipmentNumber
          and recordDelete_dateTime is null
      `)

    return result.rowsAffected[0] > 0
  } catch {
    return false
  }
}
