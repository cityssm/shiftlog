import type { Request, Response } from 'express'

import deleteWorkOrderSubscriber from '../../database/workOrders/deleteWorkOrderSubscriber.js'
import getWorkOrderSubscribers from '../../database/workOrders/getWorkOrderSubscribers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { WorkOrderSubscriber } from '../../types/record.types.js'

interface DeleteWorkOrderSubscriberForm {
  subscriberSequence: number
  workOrderId: number
}

export type DoDeleteWorkOrderSubscriberResponse =
  | {
      success: false
      errorMessage: string
    }
  | {
      success: true
      subscribers: WorkOrderSubscriber[]
    }

export default async function handler(
  request: Request<unknown, unknown, DeleteWorkOrderSubscriberForm>,
  response: Response<DoDeleteWorkOrderSubscriberResponse>
): Promise<void> {
  const success = await deleteWorkOrderSubscriber(
    request.body.workOrderId,
    request.body.subscriberSequence,
    request.session.user?.userName ?? ''
  )

  if (success) {
    const subscribers = await getWorkOrderSubscribers(request.body.workOrderId)

    response.json({
      success: true,
      subscribers
    })
  } else {
    response.json({
      success: false,
      errorMessage: `Failed to remove subscriber from ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
    })
  }
}
