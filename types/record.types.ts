import type { SettingKey } from './setting.types.js'
import type { UserSettingKey } from './user.types.js'

export interface BaseRecord {
  recordCreate_dateTime?: Date
  recordCreate_userName?: string

  recordUpdate_dateTime?: Date
  recordUpdate_userName?: string

  recordDelete_dateTime?: Date
  recordDelete_userName?: string | null
}

export interface Setting {
  settingKey: SettingKey

  previousSettingValue: string | null
  settingValue: string | null

  recordUpdate_timeMillis: number
}

export interface DatabaseUser extends BaseRecord {
  userName: string

  isActive: boolean

  shifts_canView: boolean
  shifts_canUpdate: boolean
  shifts_canManage: boolean

  workOrders_canView: boolean
  workOrders_canUpdate: boolean
  workOrders_canManage: boolean

  timesheets_canView: boolean
  timesheets_canUpdate: boolean
  timesheets_canManage: boolean

  isAdmin: boolean

  userSettings?: Partial<Record<UserSettingKey, string>>
}

export interface UserGroup extends BaseRecord {
  userGroupId: number
  userGroupName: string
  memberCount?: number
  members?: string[]
}

export interface DataListItem extends BaseRecord {
  dataListItemId: number
  dataListKey: string

  dataListItem: string
}

export interface Equipment extends BaseRecord {
  equipmentNumber: string
  equipmentName: string
  equipmentDescription: string
  equipmentTypeDataListItemId: number
  userGroupId?: number
  userGroupName?: string
}
