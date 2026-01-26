import type { Request, Response } from 'express'

import getApiAuditLogs, {
  type GetApiAuditLogsFilters
} from '../../database/api/getApiAuditLogs.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetApiAuditLogsResponse = {
  logs: Awaited<ReturnType<typeof getApiAuditLogs>>['logs']
  success: true
  totalCount: number
}

export default async function handler(
  request: Request<unknown, unknown, GetApiAuditLogsFilters>,
  response: Response<DoGetApiAuditLogsResponse>
): Promise<void> {
  const result = await getApiAuditLogs(request.body)

  response.json({
    logs: result.logs,
    success: true,
    totalCount: result.totalCount
  } satisfies DoGetApiAuditLogsResponse)
}
