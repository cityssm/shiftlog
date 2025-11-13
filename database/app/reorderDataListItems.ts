import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

export interface ReorderDataListItemsForm {
  dataListKey: string
  dataListItemIds: number[]
  userName: string
}

export default async function reorderDataListItems(
  form: ReorderDataListItemsForm
): Promise<boolean> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  try {
    for (const [index, dataListItemId] of form.dataListItemIds.entries()) {
      await pool
        .request()
        .input('dataListItemId', dataListItemId)
        .input('orderNumber', index)
        .input('userName', form.userName).query(/* sql */ `
          update ShiftLog.DataListItems
          set orderNumber = @orderNumber,
              recordUpdate_userName = @userName,
              recordUpdate_dateTime = getdate()
          where dataListItemId = @dataListItemId
            and recordDelete_dateTime is null
        `)
    }

    return true
  } catch {
    return false
  }
}
