import type { Request, Response } from 'express'

import { getConfigProperty } from '../../helpers/config.helpers.js'

export default function handler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response
): void {
  response.render('timesheets/recovery', {
    headTitle: `${getConfigProperty('timesheets.sectionName')} - Record Recovery`,
    error: request.query.error ?? ''
  })
}
