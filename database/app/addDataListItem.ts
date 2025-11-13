import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

export interface AddDataListItemForm {
  dataListKey: string
  dataListItem: string
  userGroupId?: number | null
  userName: string
}

export default async function addDataListItem(
  form: AddDataListItemForm
): Promise<boolean> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  try {
    await pool
      .request()
      .input('dataListKey', form.dataListKey)
      .input('dataListItem', form.dataListItem)
      .input('userGroupId', form.userGroupId ?? null)
      .input('userName', form.userName).query(/* sql */ `
        insert into ShiftLog.DataListItems (
          dataListKey, dataListItem, userGroupId, orderNumber,
          recordCreate_userName, recordUpdate_userName
        )
        select 
          @dataListKey, @dataListItem, @userGroupId,
          coalesce(max(orderNumber) + 1, 0),
          @userName, @userName
        from ShiftLog.DataListItems
        where dataListKey = @dataListKey
          and recordDelete_dateTime is null
      `)

    return true
  } catch {
    return false
  }
}
