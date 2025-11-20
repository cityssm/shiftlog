import type {
  ActiveDirectoryAuthenticatorConfiguration,
  ADWebAuthAuthenticatorConfiguration,
  FunctionAuthenticatorConfiguration,
  PlainTextAuthenticatorConfiguration
} from '@cityssm/authentication-helper'
import type {
  AvantiApiConfiguration,
  GetEmployeesRequest
} from '@cityssm/avanti-api/types.js'
import type {
  GetEmployeesFilters,
  GetEquipmentFilters
} from '@cityssm/worktech-api'
import type { config as MSSQLConfig } from 'mssql'

export interface Config {
  application: ConfigApplication

  session: ConfigSession

  /** Reverse Proxy Configuration */
  reverseProxy: {
    /** Disable Compression */
    disableCompression?: boolean

    /** Disable ETag */
    disableEtag?: boolean

    /** Disable Rate Limiting */
    disableRateLimit?: boolean

    /** Is traffic forwarded by a reverse proxy */
    trafficIsForwarded?: boolean

    /** URL Prefix, should start with a slash, but have no trailing slash */
    urlPrefix?: string

    disableCsrf?: boolean
  }

  login?: {
    authentication:
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
    domain: string
  }

  connectors: {
    shiftLog: MSSQLConfig

    avanti?: AvantiApiConfiguration
    pearl?: MSSQLConfig
  }

  shifts?: ConfigSection
  timesheets?: ConfigSection
  workOrders?: ConfigSection

  employees?: ConfigEmployees
  equipment?: ConfigEquipment
}

export type ConfigEmployees =
  | {
      syncSource: ''
    }
  | {
      syncSource: 'avanti'

      filters?: GetEmployeesRequest
    }
  | {
      syncSource: 'pearl'

      filters?: GetEmployeesFilters
    }

export type ConfigEquipment =
  | {
      syncSource: ''
    }
  | {
      syncSource: 'pearl'

      filters?: GetEquipmentFilters
    }

interface ConfigSection {
  isEnabled?: boolean
  router?: string

  sectionName?: string
  sectionNameSingular?: string

  iconClass?: `fa-${string}`
}

interface ConfigApplication {
  applicationName?: string
  httpPort?: number

  /** The base, public facing URL of the application, including the protocol (http or https), and any URL prefixes */
  applicationUrl?: string

  /** The maximum number of concurrent processes */
  maximumProcesses?: number

  backgroundImage?: string
}

interface ConfigSession {
  cookieName?: string
  maxAgeMillis?: number
  secret?: string

  doKeepAlive?: boolean
}
