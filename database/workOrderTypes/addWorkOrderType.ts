import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface AddWorkOrderTypeForm {
  workOrderType: string
  workOrderNumberPrefix: string
  userGroupId?: number | string
}

export default async function addWorkOrderType(
  form: AddWorkOrderTypeForm,
  userName: string
): Promise<number> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('workOrderType', form.workOrderType)
    .input('workOrderNumberPrefix', form.workOrderNumberPrefix ?? '')
    .input(
      'userGroupId',
      form.userGroupId === '' ? null : (form.userGroupId ?? null)
    )
    .input('userName', userName).query(/* sql */ `
      insert into ShiftLog.WorkOrderTypes (
        instance,
        workOrderType,
        workOrderNumberPrefix,
        userGroupId,
        orderNumber,
        recordCreate_userName,
        recordUpdate_userName
      )
      output inserted.workOrderTypeId
      values (
        @instance,
        @workOrderType,
        @workOrderNumberPrefix,
        @userGroupId,
        (
          select isnull(max(orderNumber), 0) + 1
          from ShiftLog.WorkOrderTypes
          where instance = @instance
        ),
        @userName,
        @userName
      )
    `)) as mssql.IResult<{ workOrderTypeId: number }>

  return result.recordset[0].workOrderTypeId
}
