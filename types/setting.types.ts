// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable perfectionist/sort-objects */

export type SettingKey =
  | 'application.csrfSecret'
  | 'cleanup.daysBeforePermanentDelete'
  | 'locations.defaultCityProvince'
  | 'locations.defaultLatitude'
  | 'locations.defaultLongitude'
  | 'workOrders.reopenWindowDays'

export interface SettingProperties {
  settingKey: SettingKey
  settingName: string

  description: string

  type: 'boolean' | 'number' | 'string'

  defaultValue: string

  isUserConfigurable: boolean
}

export const settingProperties: SettingProperties[] = [
  {
    settingKey: 'cleanup.daysBeforePermanentDelete',
    settingName: 'Cleanup - Days Before Permanent Delete',
    description:
      'The number of days a record must be marked as deleted before it is permanently removed from the database.',
    type: 'number',
    defaultValue: '60',
    isUserConfigurable: true
  },
  {
    settingKey: 'locations.defaultCityProvince',
    settingName: 'Locations - Default City/Province',
    description:
      'The default city/province to use when creating new work orders and locations.',
    type: 'string',
    defaultValue: '',
    isUserConfigurable: true
  },
  {
    settingKey: 'locations.defaultLatitude',
    settingName: 'Locations - Default Latitude',
    description: 'The default latitude to use when centering maps.',
    type: 'number',
    defaultValue: '46.5136',
    isUserConfigurable: true
  },
  {
    settingKey: 'locations.defaultLongitude',
    settingName: 'Locations - Default Longitude',
    description: 'The default longitude to use when centering maps.',
    type: 'number',
    defaultValue: '-84.3422',
    isUserConfigurable: true
  },
  {
    settingKey: 'application.csrfSecret',
    settingName: 'Application - CSRF Secret',
    description: 'The secret used for CSRF protection.',
    type: 'string',
    defaultValue: '',
    isUserConfigurable: false
  },
  {
    settingKey: 'workOrders.reopenWindowDays',
    settingName: 'Work Orders - Reopen Window (Days)',
    description:
      'The number of days after closing a work order that it can be reopened by users with update permissions. Set to 0 to disable reopening.',
    type: 'number',
    defaultValue: '7',
    isUserConfigurable: true
  }
]
