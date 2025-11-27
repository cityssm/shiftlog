import type { Request, Response } from 'express'

import getAssignedToDataListItems from '../../database/workOrders/getAssignedToDataListItems.js'
import getWorkOrderStatusDataListItems from '../../database/workOrders/getWorkOrderStatusDataListItems.js'
import getWorkOrderTypes from '../../database/workOrderTypes/getWorkOrderTypes.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response
): Promise<void> {
  const assignedToItems = await getAssignedToDataListItems(request.session.user)

  const workOrderStatuses = await getWorkOrderStatusDataListItems(
    request.session.user
  )

  const workOrderTypes = await getWorkOrderTypes(request.session.user)

  response.render('workOrders/search', {
    headTitle: `${getConfigProperty('workOrders.sectionName')} - Search`,

    assignedToItems,
    workOrderStatuses,
    workOrderTypes
  })
}
