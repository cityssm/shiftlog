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
    .input('userName', user?.userName)
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
        AND wt.recordDelete_dateTime IS NULL ${user === undefined
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
      ORDER BY
        wt.orderNumber,
        wt.workOrderType
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
