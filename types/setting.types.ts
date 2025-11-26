// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable perfectionist/sort-objects */

export type SettingKey =
  | 'application.csrfSecret'
  | 'locations.defaultCityProvince'
  | 'locations.defaultLatitude'
  | 'locations.defaultLongitude'

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
    type: 'string',
    defaultValue: '',
    isUserConfigurable: true
  },
  {
    settingKey: 'locations.defaultLongitude',
    settingName: 'Locations - Default Longitude',
    description: 'The default longitude to use when centering maps.',
    type: 'string',
    defaultValue: '',
    isUserConfigurable: true
  },
  {
    settingKey: 'application.csrfSecret',
    settingName: 'Application - CSRF Secret',
    description: 'The secret used for CSRF protection.',
    type: 'string',
    defaultValue: '',
    isUserConfigurable: false
  }
]
