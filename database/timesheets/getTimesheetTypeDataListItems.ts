import type { mssql } from '@cityssm/mssql-multi-pool'

import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { DataListItem } from '../../types/record.types.js'

export default async function getTimesheetTypeDataListItems(
  user?: User
): Promise<DataListItem[]> {
  const pool = await getShiftLogConnectionPool()

  const sql = /* sql */ `
    select
      dataListItemId,
      dataListKey,
      dataListItem
    from ShiftLog.DataListItems
    where dataListKey = 'timesheetTypes'
      and recordDelete_dateTime is null
      ${
        user === undefined
          ? ''
          : `
              and (
                userGroupId is null or userGroupId in (
                  select userGroupId
                  from ShiftLog.UserGroupMembers
                  where userName = @userName
                )
              )
            `
      }
    order by orderNumber, dataListItem
  `

  const result = (await pool
    .request()
    .input('userName', user?.userName)
    .query(sql)) as mssql.IResult<DataListItem>

  return result.recordset
}
