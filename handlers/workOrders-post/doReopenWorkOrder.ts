import type { Request, Response } from 'express'

import reopenWorkOrder from '../../database/workOrders/reopenWorkOrder.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('workOrders.router')}`

export default async function handler(
  request: Request<unknown, unknown, { workOrderId: number | string }>,
  response: Response
): Promise<void> {
  const workOrderId = request.body.workOrderId

  // Check workOrderId validity
  if (workOrderId === '' || Number.isNaN(Number(workOrderId))) {
    response.json({
      errorMessage: 'Invalid work order ID.',
      success: false
    })
    return
  }

  const success = await reopenWorkOrder(
    workOrderId,
    request.session.user?.userName ?? ''
  )

  if (success) {
    response.json({
      message: 'Work order reopened successfully.',
      redirectUrl: `${redirectRoot}/${workOrderId}/edit`,
      success: true
    })
  } else {
    response.json({
      errorMessage: 'Failed to reopen work order.',
      success: false
    })
  }
}
