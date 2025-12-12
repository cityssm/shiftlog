import type { Request } from 'express'

import createApiAuditLog from '../database/api/createApiAuditLog.js'

/**
 * Logs an API request to the audit log
 * @param request - Express request object
 * @param isValidApiKey - Whether the API key was valid
 * @param userName - Username associated with the API key (if valid)
 * @param responseStatus - HTTP response status code
 * @param errorMessage - Error message if request failed
 */
export async function logApiRequest(
  request: Request,
  isValidApiKey: boolean,
  userName?: string,
  responseStatus?: number,
  errorMessage?: string
): Promise<void> {
  const apiKey = request.params.apiKey
  const endpoint = request.originalUrl
  const requestMethod = request.method
  const ipAddress = (request.ip ?? request.socket.remoteAddress) || undefined
  const userAgent = request.get('user-agent')

  await createApiAuditLog({
    userName,
    apiKey,
    endpoint,
    requestMethod,
    isValidApiKey,
    ipAddress,
    userAgent,
    responseStatus,
    errorMessage
  })
}
