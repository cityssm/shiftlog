import type { Request, Response } from 'express'

import getApiAuditLogs, {
  type GetApiAuditLogsFilters
} from '../../database/api/getApiAuditLogs.js'
import type { ApiAuditLog } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetApiAuditLogsResponse = {
  success: true
  totalCount: number

  logs: ApiAuditLog[]
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
  })
}
