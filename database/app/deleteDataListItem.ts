import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

export interface DeleteDataListItemForm {
  dataListItemId: number
  userName: string
}

export default async function deleteDataListItem(
  form: DeleteDataListItemForm
): Promise<boolean> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  try {
    const result = await pool
      .request()
      .input('dataListItemId', form.dataListItemId)
      .input('userName', form.userName)
      .query(/* sql */ `
        UPDATE ShiftLog.DataListItems
        SET
          recordDelete_userName = @userName,
          recordDelete_dateTime = getdate()
        WHERE
          dataListItemId = @dataListItemId
          AND recordDelete_dateTime IS NULL
      `)

    return result.rowsAffected[0] > 0
  } catch {
    return false
  }
}
