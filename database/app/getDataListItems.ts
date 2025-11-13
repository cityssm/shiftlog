import mssqlPool, { type mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { DataListItem } from '../../types/record.types.js'

export default async function getDataListItems(
  dataListKey: string,
  userName: string
): Promise<DataListItem[]> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  const dataListItemsResult = (await pool
    .request()
    .input('dataListKey', dataListKey)
    .input('userName', userName).query(/* sql */ `
      select
      dataListItemId, dataListKey, dataListItem
      from ShiftLog.DataListItems
      where dataListKey = @dataListKey
        and (userGroupId is null or userGroupId in (
          select userGroupId
          from ShiftLog.UserGroupMembers
          where userName = @userName
        ))
        and recordDelete_dateTime is null
      order by dataListItem
    `)) as mssql.IResult<DataListItem>

  return dataListItemsResult.recordset
}
