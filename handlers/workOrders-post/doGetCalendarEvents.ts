import type { Request, Response } from 'express'

import getCalendarEvents from '../../database/workOrders/getCalendarEvents.js'
import type { WorkOrderCalendarEvent } from '../../database/workOrders/getCalendarEvents.js'

export interface DoGetCalendarEventsRequest {
  year: number | string
  month: number | string
  assignedToId?: number | string
  showOpenDates: boolean | string
  showDueDates: boolean | string
  showCloseDates: boolean | string
  showMilestoneDueDates: boolean | string
  showMilestoneCompleteDates: boolean | string
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetCalendarEventsResponse = {
  success: true
  events: WorkOrderCalendarEvent[]
}

export default async function handler(
  request: Request<unknown, unknown, DoGetCalendarEventsRequest>,
  response: Response<DoGetCalendarEventsResponse>
): Promise<void> {
  const year =
    typeof request.body.year === 'number'
      ? request.body.year
      : Number.parseInt(request.body.year, 10)

  const month =
    typeof request.body.month === 'number'
      ? request.body.month
      : Number.parseInt(request.body.month, 10)

  const assignedToId =
    request.body.assignedToId === undefined || request.body.assignedToId === ''
      ? undefined
      : typeof request.body.assignedToId === 'number'
        ? request.body.assignedToId
        : Number.parseInt(request.body.assignedToId as string, 10)

  const showOpenDates =
    typeof request.body.showOpenDates === 'boolean'
      ? request.body.showOpenDates
      : request.body.showOpenDates === 'true'

  const showDueDates =
    typeof request.body.showDueDates === 'boolean'
      ? request.body.showDueDates
      : request.body.showDueDates === 'true'

  const showCloseDates =
    typeof request.body.showCloseDates === 'boolean'
      ? request.body.showCloseDates
      : request.body.showCloseDates === 'true'

  const showMilestoneDueDates =
    typeof request.body.showMilestoneDueDates === 'boolean'
      ? request.body.showMilestoneDueDates
      : request.body.showMilestoneDueDates === 'true'

  const showMilestoneCompleteDates =
    typeof request.body.showMilestoneCompleteDates === 'boolean'
      ? request.body.showMilestoneCompleteDates
      : request.body.showMilestoneCompleteDates === 'true'

  const events = await getCalendarEvents(
    {
      year,
      month,
      assignedToId,
      showOpenDates,
      showDueDates,
      showCloseDates,
      showMilestoneDueDates,
      showMilestoneCompleteDates
    },
    request.session.user
  )

  response.json({
    success: true,
    events
  })
}
