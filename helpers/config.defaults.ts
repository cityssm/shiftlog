import type {
  ActiveDirectoryAuthenticatorConfiguration,
  ADWebAuthAuthenticatorConfiguration,
  FunctionAuthenticatorConfiguration,
  PlainTextAuthenticatorConfiguration
} from '@cityssm/authentication-helper'
import { hoursToMillis } from '@cityssm/to-millis'
import type { config as MSSQLConfig } from 'mssql'

export const configDefaultValues = {
  'application.applicationName': 'ShiftLog',
  'application.applicationUrl': undefined as string | undefined,

  'application.httpPort': 9000,
  'application.maximumProcesses': 4,

  'login.authentication': undefined as
    | {
        config: ActiveDirectoryAuthenticatorConfiguration
        type: 'activeDirectory'
      }
    | {
        config: ADWebAuthAuthenticatorConfiguration
        type: 'adWebAuth'
      }
    | {
        config: FunctionAuthenticatorConfiguration
        type: 'function'
      }
    | {
        config: PlainTextAuthenticatorConfiguration
        type: 'plainText'
      }
    | undefined,

  'login.domain': '',

  'reverseProxy.disableCompression': false,
  'reverseProxy.disableCsrf': false,
  'reverseProxy.disableEtag': false,
  'reverseProxy.disableRateLimit': false,
  'reverseProxy.trafficIsForwarded': false,
  'reverseProxy.urlPrefix': '',

  'session.cookieName': 'shiftlog-user-sid',
  'session.doKeepAlive': false,
  'session.maxAgeMillis': hoursToMillis(1),
  'session.secret': 'cityssm/shiftlog',

  'connectors.pearl': undefined as unknown as MSSQLConfig,
  'connectors.shiftLog': undefined as unknown as MSSQLConfig,

  'shifts.isEnabled': false,

  'workOrders.isEnabled': false,

  'timesheets.isEnabled': false
}

export default configDefaultValues
