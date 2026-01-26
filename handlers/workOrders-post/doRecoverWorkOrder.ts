import type { Request, Response } from 'express'

import recoverWorkOrder from '../../database/workOrders/recoverWorkOrder.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('workOrders.router')}`

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoRecoverWorkOrderResponse = {
  success: boolean
  message?: string
  redirectUrl?: string
  errorMessage?: string
}

export default async function handler(
  request: Request<unknown, unknown, { workOrderId: number | string }>,
  response: Response<DoRecoverWorkOrderResponse>
): Promise<void> {
  const success = await recoverWorkOrder(
    request.body.workOrderId,
    request.session.user?.userName ?? ''
  )

  if (success) {
    response.json({
      success: true,
      message: 'Work order recovered successfully.',
      redirectUrl: `${redirectRoot}/${request.body.workOrderId}`
    } satisfies DoRecoverWorkOrderResponse)
  } else {
    response.json({
      success: false,
      errorMessage: 'Failed to recover work order.'
    } satisfies DoRecoverWorkOrderResponse)
  }
}
