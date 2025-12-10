import type { mssql } from '@cityssm/mssql-multi-pool'

import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface CreateWorkOrderCostForm {
  workOrderId: number | string
  costAmount: number | string
  costDescription: string
}

export default async function createWorkOrderCost(
  createWorkOrderCostForm: CreateWorkOrderCostForm,
  userName: string
): Promise<number> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('workOrderId', createWorkOrderCostForm.workOrderId)
    .input('costAmount', createWorkOrderCostForm.costAmount)
    .input('costDescription', createWorkOrderCostForm.costDescription)
    .input('userName', userName).query(/* sql */ `
      insert into ShiftLog.WorkOrderCosts (
        workOrderId,
        costAmount,
        costDescription,
        recordCreate_userName,
        recordUpdate_userName
      )
      output inserted.workOrderCostId
      values (
        @workOrderId,
        @costAmount,
        @costDescription,
        @userName,
        @userName
      )
    `)) as mssql.IResult<{ workOrderCostId: number }>

  return result.recordset[0].workOrderCostId
}
