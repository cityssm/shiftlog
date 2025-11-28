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
  locations?: ConfigLocations
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

export type ConfigLocations =
  | {
      syncSource: ''
    }
  | {
      syncSource: 'arcgis'

      layerURL: string
      whereClause?: string

      mappings: {
        locationName?: ((record: unknown) => string | undefined) | string

        latitude?: ((record: unknown) => number | undefined) | string
        longitude?: ((record: unknown) => number | undefined) | string

        address1: ((record: unknown) => string | undefined) | string
        address2?: ((record: unknown) => string | undefined) | string
        cityProvince?: ((record: unknown) => string | undefined) | string
      }
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

  // The application instance key, used to differentiate installations in a single database
  instance?: string

  /** The base, public facing URL of the application, including the protocol (http or https), and any URL prefixes */
  applicationUrl?: string

  /** The maximum number of concurrent processes */
  maximumProcesses?: number

  backgroundImage?: string

  attachmentStoragePath?: string
  attachmentMaximumFileSizeBytes?: number
}

interface ConfigSession {
  cookieName?: string
  maxAgeMillis?: number
  secret?: string

  doKeepAlive?: boolean
}
