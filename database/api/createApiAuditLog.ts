import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface CreateApiAuditLogForm {
  apiKey?: string
  endpoint: string
  errorMessage?: string
  ipAddress?: string
  isValidApiKey: boolean
  requestMethod: string
  responseStatus?: number
  userAgent?: string
  userName?: string
}

export default async function createApiAuditLog(
  form: CreateApiAuditLogForm
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  try {
    await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('userName', form.userName)
      .input('apiKey', form.apiKey)
      .input('endpoint', form.endpoint)
      .input('requestMethod', form.requestMethod)
      .input('isValidApiKey', form.isValidApiKey)
      .input('ipAddress', form.ipAddress)
      .input('userAgent', form.userAgent)
      .input('responseStatus', form.responseStatus)
      .input('errorMessage', form.errorMessage).query(/* sql */ `
        insert into ShiftLog.ApiAuditLog (
          instance, userName, apiKey, endpoint, requestMethod, isValidApiKey,
          ipAddress, userAgent, responseStatus, errorMessage
        )
        values (
          @instance, @userName, @apiKey, @endpoint, @requestMethod, @isValidApiKey,
          @ipAddress, @userAgent, @responseStatus, @errorMessage
        )
      `)

    return true
  } catch (error) {
    // Log error but don't throw to avoid breaking API requests
    console.error('Failed to create API audit log:', error)
    return false
  }
}
