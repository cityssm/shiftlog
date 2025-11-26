import type { Request, Response } from 'express'

import getAssignedToDataListItems from '../../database/workOrders/getAssignedToDataListItems.js'
import getWorkOrder from '../../database/workOrders/getWorkOrder.js'
import getWorkOrderStatusDataListItems from '../../database/workOrders/getWorkOrderStatusDataListItems.js'
import getWorkOrderTypeDataListItems from '../../database/workOrders/getWorkOrderTypeDataListItems.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

import type { WorkOrderEditResponse } from './types.js'

const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('workOrders.router')}`

export default async function handler(
  request: Request<
    { workOrderId: string },
    unknown,
    unknown,
    { error?: string }
  >,
  response: Response
): Promise<void> {
  const workOrder = await getWorkOrder(
    request.params.workOrderId,
    request.session.user
  )

  if (workOrder === undefined) {
    response.redirect(`${redirectRoot}/?error=notFound`)
    return
  } else if (workOrder.workOrderCloseDateTime !== null) {
    response.redirect(
      `${redirectRoot}/${workOrder.workOrderId}?error=recordClosed`
    )
    return
  }

  const workOrderTypes = await getWorkOrderTypeDataListItems(
    request.session.user
  )

  const workOrderStatuses = await getWorkOrderStatusDataListItems(
    request.session.user
  )

  const assignedToOptions = await getAssignedToDataListItems(
    request.session.user
  )

  response.render('workOrders/edit', {
    headTitle: `${getConfigProperty('workOrders.sectionNameSingular')} #${
      workOrder.workOrderNumber
    }`,

    isCreate: false,
    isEdit: true,

    workOrder,

    assignedToOptions,
    workOrderStatuses,
    workOrderTypes
  } satisfies WorkOrderEditResponse)
}
