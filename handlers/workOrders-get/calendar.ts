import type { Request, Response } from 'express'

import getAssignedToList from '../../database/assignedTo/getAssignedToList.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response
): Promise<void> {
  const assignedToItems = await getAssignedToList(request.session.user?.userName)

  response.render('workOrders/calendar', {
    headTitle: `${getConfigProperty('workOrders.sectionName')} - Calendar`,

    error: request.query.error ?? '',

    assignedToItems
  })
}
