import type { Request, Response } from 'express'

import deleteWorkOrder from '../../database/workOrders/deleteWorkOrder.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('workOrders.router')}`

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteWorkOrderResponse = {
  success: boolean
  redirectUrl?: string
  errorMessage?: string
}

export default async function handler(
  request: Request<unknown, unknown, { workOrderId: number | string }>,
  response: Response<DoDeleteWorkOrderResponse>
): Promise<void> {
  const success = await deleteWorkOrder(
    request.body.workOrderId,
    request.session.user?.userName ?? ''
  )

  if (success) {
    response.json({
      success: true,
      redirectUrl: redirectRoot
    } satisfies DoDeleteWorkOrderResponse)
  } else {
    response.json({
      success: false,
      errorMessage: 'Failed to delete work order.'
    } satisfies DoDeleteWorkOrderResponse)
  }
}
