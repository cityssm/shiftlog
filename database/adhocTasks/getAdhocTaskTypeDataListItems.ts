import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { DataListItem } from '../../types/record.types.js'
import type { SessionUser } from '../../types/user.types.js'

export default async function getAdhocTaskTypeDataListItems(
  sessionUser?: SessionUser
): Promise<DataListItem[]> {
  const pool = await getShiftLogConnectionPool()

  const request = pool.request().input(
    'instance',
    getConfigProperty('application.instance')
  )

  let queryString = /* sql */ `
    select
      i.dataListItemId,
      i.dataListItem,
      i.orderNumber,
      i.userGroupId,
      g.userGroupName
    from ShiftLog.DataListItems i
    left join ShiftLog.UserGroups g on i.userGroupId = g.userGroupId
    where i.instance = @instance
      and i.dataListKey = 'adhocTaskTypes'
      and i.recordDelete_dateTime is null
  `

  if (
    sessionUser !== undefined &&
    sessionUser.userGroupIds !== undefined &&
    sessionUser.userGroupIds.length > 0
  ) {
    const userGroupIdString = sessionUser.userGroupIds.join(',')
    queryString += /* sql */ ` and (i.userGroupId is null or i.userGroupId in (${userGroupIdString}))`
  } else {
    queryString += /* sql */ ` and i.userGroupId is null`
  }

  queryString += /* sql */ `
    order by i.orderNumber, i.dataListItem
  `

  const result = (await request.query(queryString)) as mssql.IResult<DataListItem>

  return result.recordset
}
