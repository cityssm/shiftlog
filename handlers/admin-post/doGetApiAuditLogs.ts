import type { Request, Response } from 'express'

import getApiAuditLogs, {
  type GetApiAuditLogsFilters
} from '../../database/api/getApiAuditLogs.js'

export default async function handler(
  request: Request<unknown, unknown, GetApiAuditLogsFilters>,
  response: Response
): Promise<void> {
  const logs = await getApiAuditLogs(request.body)

  response.json({
    logs,
    success: true
  })
}
