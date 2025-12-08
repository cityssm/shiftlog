import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrderType } from '../../types/record.types.js'

import getWorkOrderTypeMoreInfoFormNames from './getWorkOrderTypeMoreInfoFormNames.js'

export default async function getWorkOrderTypes(
  user?: User
): Promise<WorkOrderType[]> {
  const pool = await getShiftLogConnectionPool()

  const workOrderTypesResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', user?.userName).query<WorkOrderType>(/* sql */ `
      select
        wt.workOrderTypeId,
        wt.workOrderType,
        wt.workOrderNumberPrefix,
        wt.dueDays,
        wt.orderNumber,
        wt.userGroupId,
        ug.userGroupName
      from ShiftLog.WorkOrderTypes wt
      left join ShiftLog.UserGroups ug
        on wt.userGroupId = ug.userGroupId
      where wt.instance = @instance
        and wt.recordDelete_dateTime is null
        ${
          user === undefined
            ? ''
            : `
                and (wt.userGroupId is null or wt.userGroupId in (
                  select userGroupId
                  from ShiftLog.UserGroupMembers
                  where userName = @userName
                ))
              `
        }
      order by wt.orderNumber, wt.workOrderType
    `)

  const workOrderTypes = workOrderTypesResult.recordset

  for (const workOrderType of workOrderTypes) {
    // eslint-disable-next-line no-await-in-loop
    workOrderType.moreInfoFormNames = await getWorkOrderTypeMoreInfoFormNames(
      workOrderType.workOrderTypeId
    )
  }

  return workOrderTypes
}
