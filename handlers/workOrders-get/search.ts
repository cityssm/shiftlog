import type { Request, Response } from 'express'

import getAssignedToList from '../../database/assignedTo/getAssignedToList.js'
import getTags from '../../database/tags/getTags.js'
import getWorkOrderPriorityDataListItems from '../../database/workOrders/getWorkOrderPriorityDataListItems.js'
import getWorkOrderStatusDataListItems from '../../database/workOrders/getWorkOrderStatusDataListItems.js'
import getWorkOrderTypes from '../../database/workOrderTypes/getWorkOrderTypes.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response
): Promise<void> {
  const assignedToItems = await getAssignedToList(request.session.user?.userName)

  const workOrderStatuses = await getWorkOrderStatusDataListItems(
    request.session.user
  )

  const workOrderPriorities = await getWorkOrderPriorityDataListItems(
    request.session.user
  )

  const workOrderTypes = await getWorkOrderTypes(request.session.user)

  const tags = await getTags()

  response.render('workOrders/search', {
    headTitle: `${getConfigProperty('workOrders.sectionName')} - Search`,
    section: 'workOrders',

    error: request.query.error ?? '',

    assignedToItems,
    workOrderStatuses,
    workOrderPriorities,
    workOrderTypes,
    tags
  })
}
