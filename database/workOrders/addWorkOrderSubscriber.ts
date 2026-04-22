import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

import getWorkOrder from './getWorkOrder.js'

export default async function addWorkOrderSubscriber(
  workOrderId: number,
  subscriberEmailAddress: string,
  userName: string
): Promise<boolean> {
  try {
    const workOrder = await getWorkOrder(workOrderId)

    if (workOrder === undefined) {
      return false
    }

    const trimmedSubscriberEmailAddress = subscriberEmailAddress.trim()

    if (trimmedSubscriberEmailAddress === '') {
      return false
    }

    const pool = await getShiftLogConnectionPool()

    await pool
      .request()
      .input('workOrderId', workOrderId)
      .input('subscriberEmailAddress', trimmedSubscriberEmailAddress)
      .input('userName', userName)
      .query(/* sql */ `
        IF NOT EXISTS (
          SELECT
            1
          FROM
            ShiftLog.WorkOrderSubscribers
          WHERE
            workOrderId = @workOrderId
            AND subscriberEmailAddress = @subscriberEmailAddress
            AND recordDelete_dateTime IS NULL
        )
        BEGIN
          INSERT INTO
            ShiftLog.WorkOrderSubscribers (
              workOrderId,
              subscriberSequence,
              subscriberEmailAddress,
              recordCreate_userName,
              recordUpdate_userName
            )
          VALUES
            (
              @workOrderId,
              (
                SELECT
                  isnull(max(subscriberSequence), 0) + 1
                FROM
                  ShiftLog.WorkOrderSubscribers
                WHERE
                  workOrderId = @workOrderId
              ),
              @subscriberEmailAddress,
              @userName,
              @userName
            )
        END
      `)

    return true
  } catch {
    return false
  }
}
