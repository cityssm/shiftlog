import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrderType } from '../../types/record.types.js'

export default async function getWorkOrderTypesAdmin(): Promise<
  WorkOrderType[]
> {
  const pool = await getShiftLogConnectionPool()

  const workOrderTypesResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .query<WorkOrderType>(/* sql */ `
      select
        wt.workOrderTypeId,
        wt.workOrderType,
        wt.workOrderNumberPrefix,
        wt.orderNumber,
        wt.userGroupId,
        ug.userGroupName
      from ShiftLog.WorkOrderTypes wt
      left join ShiftLog.UserGroups ug
        on wt.userGroupId = ug.userGroupId
      where wt.instance = @instance
        and wt.recordDelete_dateTime is null
      order by wt.orderNumber, wt.workOrderType
    `)

  return workOrderTypesResult.recordset
}
