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

  employeeNumber?: string | null
  firstName?: string | null
  lastName?: string | null

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

export interface Employee extends BaseRecord {
  employeeNumber: string
  firstName: string
  lastName: string

  userName?: string | null
  isSupervisor: boolean

  phoneNumber?: string | null
  phoneNumberAlternate?: string | null
  emailAddress?: string | null

  userGroupId?: number | null
}

export interface Crew extends BaseRecord {
  crewId: number
  crewName: string
  userGroupId?: number | null
  userGroupName?: string
  memberCount?: number
}

// Shifts

export interface Shift extends BaseRecord {
  shiftId: number

  shiftDate: Date | string

  shiftTimeDataListItem?: string
  shiftTimeDataListItemId: number

  shiftTypeDataListItem?: string
  shiftTypeDataListItemId: number
  
  supervisorEmployeeNumber: string
  supervisorFirstName?: string
  supervisorLastName?: string
  supervisorUserName?: string | null

  shiftDescription: string

  recordLock_dateTime?: Date | null
}

export interface ShiftCrew {
  shiftId: number
  crewId: number
  crewName?: string
  shiftCrewNote: string
  userGroupId?: number | null
}

export interface ShiftEmployee {
  shiftId: number
  employeeNumber: string
  firstName?: string
  lastName?: string
  crewId?: number | null
  crewName?: string
  shiftEmployeeNote: string
  userGroupId?: number | null
}

export interface ShiftEquipment {
  shiftId: number
  equipmentNumber: string
  equipmentName?: string
  employeeNumber?: string | null
  employeeFirstName?: string
  employeeLastName?: string
  shiftEquipmentNote: string
  userGroupId?: number | null
}

// Timesheets

export interface Timesheet extends BaseRecord {
  timesheetId: number
  
  supervisorEmployeeNumber: string
  supervisorFirstName?: string
  supervisorLastName?: string
  supervisorUserName?: string | null

  timesheetTypeDataListItemId: number
  timesheetTypeDataListItem?: string
  
  timesheetTitle: string
  timesheetNote: string

  timesheetDate: Date | string
  
  shiftId?: number | null
  shiftDescription?: string

  recordSubmitted_dateTime?: Date | null
  recordSubmitted_userName?: string | null

  employeesEntered_dateTime?: Date | null
  employeesEntered_userName?: string | null

  equipmentEntered_dateTime?: Date | null
  equipmentEntered_userName?: string | null
}

export interface TimesheetColumn {
  timesheetColumnId: number
  timesheetId: number
  columnTitle: string

  workOrderNumber?: string | null
  costCenterA?: string | null
  costCenterB?: string | null

  orderNumber: number
}

export interface TimesheetRow {
  timesheetRowId: number
  timesheetId: number
  rowTitle: string

  employeeNumber?: string | null
  employeeFirstName?: string
  employeeLastName?: string

  equipmentNumber?: string | null
  equipmentName?: string

  jobClassificationDataListItemId?: number | null
  jobClassificationDataListItem?: string

  timeCodeDataListItemId?: number | null
  timeCodeDataListItem?: string

  userGroupId?: number | null
}

export interface TimesheetCell {
  timesheetRowId: number
  timesheetColumnId: number

  recordHours: number

  mappedPositionCode?: string | null
  mappedPayCode?: string | null
  mappedTimeCode?: string | null
  mappingConfidence: number
}
