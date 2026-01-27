import type { mssql } from '@cityssm/mssql-multi-pool'

import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface CreateWorkOrderMilestoneForm {
  workOrderId: number | string
  milestoneTitle: string
  milestoneDescription?: string
  milestoneDueDateTimeString?: string
  milestoneCompleteDateTimeString?: string
  assignedToId?: number | string
}

export default async function createWorkOrderMilestone(
  form: CreateWorkOrderMilestoneForm,
  userName: string
): Promise<number> {
  const pool = await getShiftLogConnectionPool()

  // Get the next order number
  const orderResult = (await pool
    .request()
    .input('workOrderId', form.workOrderId)
    .query(/* sql */ `
      SELECT
        isnull(max(orderNumber), 0) + 1 AS nextOrderNumber
      FROM
        ShiftLog.WorkOrderMilestones
      WHERE
        workOrderId = @workOrderId
        AND recordDelete_dateTime IS NULL
    `)) as mssql.IResult<{ nextOrderNumber: number }>

  const nextOrderNumber = orderResult.recordset[0].nextOrderNumber

  const result = (await pool
    .request()
    .input('workOrderId', form.workOrderId)
    .input('milestoneTitle', form.milestoneTitle)
    .input('milestoneDescription', form.milestoneDescription ?? '')
    .input(
      'milestoneDueDateTime',
      form.milestoneDueDateTimeString
        ? new Date(form.milestoneDueDateTimeString)
        : null
    )
    .input(
      'milestoneCompleteDateTime',
      form.milestoneCompleteDateTimeString
        ? new Date(form.milestoneCompleteDateTimeString)
        : null
    )
    .input(
      'assignedToId',
      form.assignedToId && form.assignedToId !== '' ? form.assignedToId : null
    )
    .input('orderNumber', nextOrderNumber)
    .input('userName', userName)
    .query(/* sql */ `
      INSERT INTO
        ShiftLog.WorkOrderMilestones (
          workOrderId,
          milestoneTitle,
          milestoneDescription,
          milestoneDueDateTime,
          milestoneCompleteDateTime,
          assignedToId,
          orderNumber,
          recordCreate_userName,
          recordUpdate_userName
        ) output inserted.workOrderMilestoneId
      VALUES
        (
          @workOrderId,
          @milestoneTitle,
          @milestoneDescription,
          @milestoneDueDateTime,
          @milestoneCompleteDateTime,
          @assignedToId,
          @orderNumber,
          @userName,
          @userName
        )
    `)) as mssql.IResult<{ workOrderMilestoneId: number }>

  return result.recordset[0].workOrderMilestoneId
}
