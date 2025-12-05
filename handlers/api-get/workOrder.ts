import type { Request, Response } from 'express'
import ical, { ICalEventStatus } from 'ical-generator'

import { getUserByApiKey } from '../../database/users/getUser.js'
import getWorkOrder from '../../database/workOrders/getWorkOrder.js'
import getWorkOrderMilestones from '../../database/workOrders/getWorkOrderMilestones.js'
import { getApplicationUrl } from '../../helpers/application.helpers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request<{ apiKey: string; workOrderId: string }, unknown, unknown>,
  response: Response
): Promise<void> {
  // Authenticate API user

  const apiUser = await getUserByApiKey(request.params.apiKey)

  if (apiUser === undefined) {
    response.status(401).json({ error: 'Invalid API key' })
    return
  }

  // Get work order

  const workOrder = await getWorkOrder(
    request.params.workOrderId,
    apiUser.userName
  )

  if (workOrder === undefined) {
    response
      .status(404)
      .json({ error: 'Access denied or work order not found' })
    return
  }

  const workOrderMilestones = await getWorkOrderMilestones(
    workOrder.workOrderId
  )

  // Create calendar

  const workOrderUrl = `${getApplicationUrl(request)}/${getConfigProperty(
    'workOrders.router'
  )}/${workOrder.workOrderId}`

  const descriptionString = `Work Order #${workOrder.workOrderNumber}\n\n${workOrderUrl}`

  const calendar = ical({
    name: `Work Order #${workOrder.workOrderNumber}`,
    prodId: {
      company: 'cityssm.github.io/shiftlog',
      product: `${getConfigProperty('application.applicationName')} (${getConfigProperty('application.instance')})`
    },
    url: workOrderUrl
  })

  const workOrderIsClosed = Boolean(workOrder.workOrderCloseDateTime)

  // Open event
  calendar.createEvent({
    start: workOrder.workOrderOpenDateTime,
    status: workOrderIsClosed
      ? ICalEventStatus.CANCELLED
      : ICalEventStatus.CONFIRMED,

    summary: `▶️ Opened: ${workOrder.workOrderNumber}`,
    description: descriptionString,

    url: workOrderUrl
  })

  // Due event
  if (workOrder.workOrderDueDateTime) {
    calendar.createEvent({
      start: workOrder.workOrderDueDateTime,
      status: workOrder.workOrderCloseDateTime
        ? ICalEventStatus.CANCELLED
        : ICalEventStatus.CONFIRMED,

      summary: `${workOrder.workOrderCloseDateTime ? '⚠️' : '✅'} Due: ${workOrder.workOrderNumber}`,
      description: descriptionString,

      url: workOrderUrl
    })
  }

  // Close event
  if (workOrder.workOrderCloseDateTime) {
    calendar.createEvent({
      start: workOrder.workOrderCloseDateTime,
      status: ICalEventStatus.CONFIRMED,

      summary: `⏹️ Closed: ${workOrder.workOrderNumber}`,
      description: descriptionString,

      url: workOrderUrl
    })
  }

  for (const milestone of workOrderMilestones) {
    if (milestone.milestoneDueDateTime) {
      calendar.createEvent({
        start: milestone.milestoneDueDateTime,
        status: milestone.milestoneCompleteDateTime
          ? ICalEventStatus.CANCELLED
          : ICalEventStatus.CONFIRMED,

        summary: `${milestone.milestoneCompleteDateTime ? '✅' : '⚠️'} Milestone Due: ${workOrder.workOrderNumber} - ${milestone.milestoneTitle}`,
        description: `Work Order #${workOrder.workOrderNumber}\nMilestone: ${milestone.milestoneTitle}\n\n${workOrderUrl}`,

        url: workOrderUrl
      })
    }

    if (milestone.milestoneCompleteDateTime) {
      calendar.createEvent({
        start: milestone.milestoneCompleteDateTime,
        status: ICalEventStatus.CONFIRMED,
        summary: `⏹️ Milestone Completed: ${workOrder.workOrderNumber} - ${milestone.milestoneTitle}`,
        description: `Work Order #${workOrder.workOrderNumber}\nMilestone: ${milestone.milestoneTitle}\n\n${workOrderUrl}`,
        url: workOrderUrl
      })
    }
  }

  response
    .setHeader('Content-Disposition', 'inline; filename=workOrder.ics')
    .setHeader('Content-Type', 'text/calendar; charset=utf-8')
    .send(calendar.toString())
}
