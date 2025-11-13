import mssqlPool, { type mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

export interface DataListItemWithDetails {
  dataListItemId: number
  dataListKey: string
  dataListItem: string
  orderNumber: number
  userGroupId: number | null
}

export default async function getDataListItemsAdmin(
  dataListKey: string
): Promise<DataListItemWithDetails[]> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  const dataListItemsResult = (await pool
    .request()
    .input('dataListKey', dataListKey).query(/* sql */ `
      select
        dataListItemId, dataListKey, dataListItem, orderNumber, userGroupId
      from ShiftLog.DataListItems
      where dataListKey = @dataListKey
        and recordDelete_dateTime is null
      order by orderNumber, dataListItem
    `)) as mssql.IResult<DataListItemWithDetails>

  return dataListItemsResult.recordset
}
