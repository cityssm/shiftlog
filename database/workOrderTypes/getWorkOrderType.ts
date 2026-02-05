import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrderType } from '../../types/record.types.js'

import getWorkOrderTypeMoreInfoFormNames from './getWorkOrderTypeMoreInfoFormNames.js'

export default async function getWorkOrderType(
  workOrderTypeId: number | string,
  user?: User,
  includeDeleted = false
): Promise<WorkOrderType | undefined> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', user?.userName ?? '')
    .input('workOrderTypeId', workOrderTypeId)
    .query<WorkOrderType>(/* sql */ `
      SELECT
        wt.workOrderTypeId,
        wt.workOrderType,
        wt.workOrderNumberPrefix,
        wt.dueDays,
        wt.orderNumber,
        wt.userGroupId,
        ug.userGroupName
      FROM
        ShiftLog.WorkOrderTypes wt
        LEFT JOIN ShiftLog.UserGroups ug ON wt.userGroupId = ug.userGroupId
      WHERE
        wt.instance = @instance
        AND wt.workOrderTypeId = @workOrderTypeId ${includeDeleted
          ? ''
          : 'and wt.recordDelete_dateTime is null'} ${user === undefined
          ? ''
          : /* sql */ `
              AND (
                wt.userGroupId IS NULL
                OR wt.userGroupId IN (
                  SELECT
                    userGroupId
                  FROM
                    ShiftLog.UserGroupMembers
                  WHERE
                    userName = @userName
                )
              )
            `}
    `)

  const workOrderType = result.recordset[0]

  workOrderType.moreInfoFormNames = await getWorkOrderTypeMoreInfoFormNames(
    workOrderType.workOrderTypeId
  )

  return workOrderType
}
