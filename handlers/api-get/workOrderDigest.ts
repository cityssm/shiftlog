import type { Request, Response } from 'express'

import { getUserByApiKey } from '../../database/users/getUser.js'
import { getWorkOrdersForDigest } from '../../database/workOrders/getWorkOrdersForDigest.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request<
    { apiKey: string },
    unknown,
    unknown,
    { assignedToDataListItemId?: string }
  >,
  response: Response
): Promise<void> {
  // Authenticate API user
  const apiUser = await getUserByApiKey(request.params.apiKey)

  if (apiUser === undefined) {
    response.status(401).json({ error: 'Invalid API key' })
    return
  }

  // Validate required parameter
  if (!request.query.assignedToDataListItemId) {
    response
      .status(400)
      .json({ error: 'Missing required parameter: assignedToDataListItemId' })
    return
  }

  // Get digest data
  const digestData = await getWorkOrdersForDigest(
    request.query.assignedToDataListItemId
  )

  // Generate report date/time
  const reportDateTime = new Date()

  // Render the print view
  response.render('print/workOrderDigest', {
    headTitle: `${getConfigProperty('workOrders.sectionName')} Digest`,

    workOrders: digestData.workOrders,
    milestones: digestData.milestones,
    reportDateTime,
    assignedToDataListItemId: request.query.assignedToDataListItemId
  })
}
