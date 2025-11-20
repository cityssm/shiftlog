import type { Request, Response } from 'express'

import getWorkOrderStatusDataListItems from '../../database/workOrders/getWorkOrderStatusDataListItems.js'
import getWorkOrderTypeDataListItems from '../../database/workOrders/getWorkOrderTypeDataListItems.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response
): Promise<void> {
  const workOrderTypes = await getWorkOrderTypeDataListItems(request.session.user)
  
  const workOrderStatuses = await getWorkOrderStatusDataListItems(request.session.user)

  response.render('workOrders/search', {
    headTitle: `${getConfigProperty('workOrders.sectionName')} - Search`,

    workOrderTypes,
    workOrderStatuses
  })
}
