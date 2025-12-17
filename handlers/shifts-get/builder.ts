import type { Request, Response } from 'express'

import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request<unknown, unknown, unknown, { error?: string }>,
  response: Response
): Promise<void> {
  response.render('shifts/builder', {
    headTitle: `${getConfigProperty('shifts.sectionNameSingular')} Builder`,
    error: request.query.error ?? ''
  })
}
