// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface UpdateWorkOrderTypeForm {
  userGroupId?: number | string
  workOrderNumberPrefix?: string
  workOrderType: string
  workOrderTypeId: number | string
}

export default async function updateWorkOrderType(
  form: UpdateWorkOrderTypeForm,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('workOrderTypeId', form.workOrderTypeId)
    .input('workOrderType', form.workOrderType)
    .input('workOrderNumberPrefix', form.workOrderNumberPrefix ?? '')
    .input(
      'userGroupId',
      form.userGroupId === '' ? null : (form.userGroupId ?? null)
    )
    .input('userName', userName).query(/* sql */ `
      update ShiftLog.WorkOrderTypes
      set
        workOrderType = @workOrderType,
        workOrderNumberPrefix = @workOrderNumberPrefix,
        userGroupId = @userGroupId,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      where instance = @instance
        and workOrderTypeId = @workOrderTypeId
        and recordDelete_dateTime is null
    `)

  return result.rowsAffected[0] > 0
}
