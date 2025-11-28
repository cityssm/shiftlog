import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { DataListItem } from '../../types/record.types.js'

export default async function getDataListItems(
  dataListKey: string,
  user?: User
): Promise<DataListItem[]> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  const dataListItemsResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('dataListKey', dataListKey)
    .input('userName', user?.userName).query<DataListItem>(/* sql */ `
      select
        i.dataListItemId, i.dataListKey, i.dataListItem
      from ShiftLog.DataListItems i
      where i.instance = @instance
        and i.dataListKey = @dataListKey
        and i.recordDelete_dateTime is null
        ${
          user === undefined
            ? ''
            : `
                and (i.userGroupId is null or i.userGroupId in (
                  select userGroupId
                  from ShiftLog.UserGroupMembers
                  where userName = @userName
                ))
              `
        }
      order by i.orderNumber, i.dataListItem
    `)

  return dataListItemsResult.recordset
}
