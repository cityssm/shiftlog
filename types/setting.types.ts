// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable perfectionist/sort-objects */

export type SettingKey = 'application.csrfSecret'

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
    settingKey: 'application.csrfSecret',
    settingName: 'Application - CSRF Secret',
    description: 'The secret used for CSRF protection.',
    type: 'string',
    defaultValue: '',
    isUserConfigurable: false
  }
]
