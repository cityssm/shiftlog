import type { Request, Response } from 'express'
import PapaParse from 'papaparse'

import getReportData from '../../database/reports/getReportData.js'
import type { ReportParameters } from '../../database/reports/types.js'
import { getUserByApiKey } from '../../database/users/getUser.js'

export default async function handler(
  request: Request<
    { apiKey: string; reportKey: string },
    unknown,
    unknown,
    ReportParameters
  >,
  response: Response
): Promise<void> {

  const apiUser = await getUserByApiKey(request.params.apiKey)

  if (apiUser === undefined) {
    response.status(401).json({ error: 'Invalid API key' })
    return
  }

  const reportData = await getReportData(
    request.params.reportKey,
    request.query,
    apiUser
  )

  if (reportData === undefined) {
    response.status(403).json({ error: 'Access denied or report not found' })
    return
  }

  const csv = PapaParse.unparse(reportData)

  response.setHeader(
    'Content-Disposition',
    `attachment; filename="${request.params.reportKey}.csv"`
  )
  response.setHeader('Content-Type', 'text/csv')

  response.status(200).send(csv)
}
