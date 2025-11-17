import type { Request, Response } from 'express'

import type { GetTimesheetsFilters, GetTimesheetsOptions } from '../../database/timesheets/getTimesheets.js'
import getTimesheets from '../../database/timesheets/getTimesheets.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    GetTimesheetsFilters & GetTimesheetsOptions
  >,
  response: Response
): Promise<void> {
  const filters: GetTimesheetsFilters = {
    timesheetDateString: request.body.timesheetDateString,
    supervisorEmployeeNumber: request.body.supervisorEmployeeNumber,
    timesheetTypeDataListItemId: request.body.timesheetTypeDataListItemId
  }

  const options: GetTimesheetsOptions = {
    limit: request.body.limit ?? 50,
    offset: request.body.offset ?? 0
  }

  const result = await getTimesheets(filters, options, request.session.user)

  response.json(result)
}
