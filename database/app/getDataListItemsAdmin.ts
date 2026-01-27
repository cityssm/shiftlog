import mssqlPool from '@cityssm/mssql-multi-pool'

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

  const dataListItemsResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('dataListKey', dataListKey)
    .query<DataListItemWithDetails>(/* sql */ `
      SELECT
        dataListItemId,
        dataListKey,
        dataListItem,
        orderNumber,
        userGroupId
      FROM
        ShiftLog.DataListItems
      WHERE
        instance = @instance
        AND dataListKey = @dataListKey
        AND recordDelete_dateTime IS NULL
      ORDER BY
        orderNumber,
        dataListItem
    `)

  return dataListItemsResult.recordset
}
