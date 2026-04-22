import type { Request, Response } from 'express'

import addWorkOrderSubscriber from '../../database/workOrders/addWorkOrderSubscriber.js'
import getWorkOrderSubscribers from '../../database/workOrders/getWorkOrderSubscribers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { WorkOrderSubscriber } from '../../types/record.types.js'

interface AddWorkOrderSubscriberForm {
  workOrderId: number
  subscriberEmailAddress: string
}

export type DoAddWorkOrderSubscriberResponse =
  | {
      success: false
      errorMessage: string
    }
  | {
      success: true
      subscribers: WorkOrderSubscriber[]
    }

export default async function handler(
  request: Request<unknown, unknown, AddWorkOrderSubscriberForm>,
  response: Response<DoAddWorkOrderSubscriberResponse>
): Promise<void> {
  const success = await addWorkOrderSubscriber(
    request.body.workOrderId,
    request.body.subscriberEmailAddress,
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
      errorMessage: `Failed to add subscriber to ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
    })
  }
}
