import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

export interface UpdateDataListItemForm {
  dataListItemId: number
  dataListItem: string
  userName: string
}

export default async function updateDataListItem(
  form: UpdateDataListItemForm
): Promise<boolean> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  try {
    const result = await pool
      .request()
      .input('dataListItemId', form.dataListItemId)
      .input('dataListItem', form.dataListItem)
      .input('userName', form.userName).query(/* sql */ `
        update ShiftLog.DataListItems
        set dataListItem = @dataListItem,
            recordUpdate_userName = @userName,
            recordUpdate_dateTime = getdate()
        where dataListItemId = @dataListItemId
          and recordDelete_dateTime is null
      `)

    return result.rowsAffected[0] > 0
  } catch {
    return false
  }
}
