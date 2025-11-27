import type {
  ActiveDirectoryAuthenticatorConfiguration,
  ADWebAuthAuthenticatorConfiguration,
  FunctionAuthenticatorConfiguration,
  PlainTextAuthenticatorConfiguration
} from '@cityssm/authentication-helper'
import type { AvantiApiConfiguration } from '@cityssm/avanti-api'
import { hoursToMillis } from '@cityssm/to-millis'
import type { config as MSSQLConfig } from 'mssql'

import type {
  ConfigEmployees,
  ConfigEquipment,
  ConfigLocations
} from '../types/config.types.js'

export const configDefaultValues = {
  'application.applicationName': 'ShiftLog',
  'application.applicationUrl': undefined as string | undefined,
  'application.backgroundImage': 'background.jpg',

  'application.instance': '',

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

  'connectors.shiftLog': undefined as unknown as MSSQLConfig,

  'connectors.avanti': undefined as unknown as
    | AvantiApiConfiguration
    | undefined,
  'connectors.pearl': undefined as unknown as MSSQLConfig | undefined,

  // Shifts

  'shifts.isEnabled': false,
  'shifts.router': 'shifts',

  'shifts.sectionName': 'Shifts',
  'shifts.sectionNameSingular': 'Shift',

  'shifts.iconClass': 'fa-calendar-day',

  // Work Orders

  'workOrders.isEnabled': false,
  'workOrders.router': 'workOrders',

  'workOrders.sectionName': 'Work Orders',
  'workOrders.sectionNameSingular': 'Work Order',

  'workOrders.iconClass': 'fa-hard-hat',

  // Timesheets

  'timesheets.isEnabled': false,
  'timesheets.router': 'timesheets',

  'timesheets.sectionName': 'Timesheets',
  'timesheets.sectionNameSingular': 'Timesheet',

  'timesheets.iconClass': 'fa-clock',

  // Employees

  employees: {
    syncSource: ''
  } as unknown as ConfigEmployees,
  'employees.syncSource': '',

  // Equipment

  equipment: {
    syncSource: ''
  } as unknown as ConfigEquipment,
  'equipment.syncSource': '',

  // Locations
  locations: {
    syncSource: ''
  } as unknown as ConfigLocations,
  'locations.syncSource': ''
}

export default configDefaultValues
