import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface CreateAssignedToForm {
  assignedToName: string
  userGroupId?: number | string
}

export default async function createAssignedToItem(
  form: CreateAssignedToForm,
  userName: string
): Promise<number> {
  const pool = await getShiftLogConnectionPool()

  // Check if a deleted item with the same name exists
  const existingResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('assignedToName', form.assignedToName)
    .query<{ assignedToId: number }>(/* sql */ `
      SELECT
        assignedToId
      FROM
        ShiftLog.AssignedTo
      WHERE
        instance = @instance
        AND assignedToName = @assignedToName
        AND recordDelete_dateTime IS NOT NULL
    `)

  // If a deleted item exists, undelete it
  if (existingResult.recordset.length > 0) {
    const assignedToId = existingResult.recordset[0].assignedToId

    await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('assignedToId', assignedToId)
      .input(
        'userGroupId',
        form.userGroupId && form.userGroupId !== '' ? form.userGroupId : null
      )
      .input('userName', userName)
      .query(/* sql */ `
        UPDATE ShiftLog.AssignedTo
        SET
          userGroupId = @userGroupId,
          recordDelete_userName = NULL,
          recordDelete_dateTime = NULL,
          recordUpdate_userName = @userName,
          recordUpdate_dateTime = getdate()
        WHERE
          assignedToId = @assignedToId
          AND instance = @instance
      `)

    return assignedToId
  }

  // Get the next order number
  const orderResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .query<{ nextOrderNumber: number }>(/* sql */ `
      SELECT
        isnull(max(orderNumber), 0) + 1 AS nextOrderNumber
      FROM
        ShiftLog.AssignedTo
      WHERE
        instance = @instance
        AND recordDelete_dateTime IS NULL
    `)

  const nextOrderNumber = orderResult.recordset[0].nextOrderNumber

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('assignedToName', form.assignedToName)
    .input(
      'userGroupId',
      form.userGroupId && form.userGroupId !== '' ? form.userGroupId : null
    )
    .input('orderNumber', nextOrderNumber)
    .input('userName', userName)
    .query<{ assignedToId: number }>(/* sql */ `
      INSERT INTO
        ShiftLog.AssignedTo (
          instance,
          assignedToName,
          userGroupId,
          orderNumber,
          recordCreate_userName,
          recordUpdate_userName
        ) output inserted.assignedToId
      VALUES
        (
          @instance,
          @assignedToName,
          @userGroupId,
          @orderNumber,
          @userName,
          @userName
        )
    `)

  return result.recordset[0].assignedToId
}
