import type { SettingKey } from './setting.types.js'
import type { UserSettingKey } from './user.types.js'

export interface BaseRecord {
  recordCreate_dateTime?: Date
  recordCreate_userName?: string

  recordUpdate_dateTime?: Date
  recordUpdate_userName?: string

  recordDelete_dateTime?: Date | null
  recordDelete_userName?: string | null
}

export interface SyncRecord extends BaseRecord {
  recordSync_isSynced: boolean
  recordSync_source?: string | null
  recordSync_dateTime?: Date | null
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

  shifts_canManage: boolean
  shifts_canUpdate: boolean
  shifts_canView: boolean

  workOrders_canManage: boolean
  workOrders_canUpdate: boolean
  workOrders_canView: boolean

  timesheets_canManage: boolean
  timesheets_canUpdate: boolean
  timesheets_canView: boolean

  isAdmin: boolean

  userSettings?: Partial<Record<UserSettingKey, string>>
}

export interface ApiAuditLog {
  auditLogId: number
  userName?: string | null
  apiKey?: string | null
  endpoint: string
  requestMethod: string
  isValidApiKey: boolean
  requestTime: Date
  ipAddress?: string | null
  userAgent?: string | null
  responseStatus?: number | null
  errorMessage?: string | null
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

  userGroupId?: number | null
  userGroupName?: string
}

export interface Equipment extends SyncRecord {
  equipmentNumber: string

  equipmentName: string
  equipmentDescription: string

  equipmentTypeDataListItem?: string
  equipmentTypeDataListItemId: number

  employeeListId?: number | null
  employeeListName?: string

  userGroupId?: number
  userGroupName?: string
}

export interface AssignedTo extends BaseRecord {
  assignedToId: number
  assignedToName: string
  orderNumber: number
  userGroupId?: number | null
  userGroupName?: string
}

export interface Location extends SyncRecord {
  locationId: number

  latitude?: number | null
  longitude?: number | null

  address1: string
  address2: string
  cityProvince: string
}

export interface Employee extends SyncRecord {
  employeeNumber: string
  firstName: string
  lastName: string

  userName?: string | null
  isSupervisor: boolean

  emailAddress?: string | null
  phoneNumber?: string | null
  phoneNumberAlternate?: string | null

  userGroupId?: number | null
}

export interface Tag extends BaseRecord {
  tagName: string
  tagBackgroundColor: string
  tagTextColor: string
}

export interface NoteType extends BaseRecord {
  noteTypeId: number
  noteType: string
  userGroupId?: number | null
  userGroupName?: string | null
  isAvailableWorkOrders: boolean
  isAvailableShifts: boolean
  isAvailableTimesheets: boolean
}

export interface NoteTypeField extends BaseRecord {
  noteTypeFieldId: number
  noteTypeId: number
  fieldLabel: string
  fieldInputType: 'text' | 'number' | 'date' | 'select' | 'textbox'
  fieldHelpText: string
  dataListKey?: string | null
  fieldValueMin?: number | null
  fieldValueMax?: number | null
  fieldValueRequired: boolean
  hasDividerAbove: boolean
}

export interface Crew extends BaseRecord {
  crewId: number
  crewName: string
  userGroupId?: number | null
  userGroupName?: string | null

  memberCount?: number
}

export interface CrewMember {
  crewId: number
  employeeNumber: string
  firstName?: string
  lastName?: string
}

export interface CrewEquipment {
  crewId: number
  equipmentNumber: string
  equipmentName?: string

  employeeNumber?: string | null
  employeeFirstName?: string
  employeeLastName?: string

  employeeListId?: number | null
  employeeListName?: string
}

export interface EmployeeList extends BaseRecord {
  employeeListId: number
  employeeListName: string
  userGroupId?: number | null
  userGroupName?: string

  memberCount?: number
}

export interface EmployeeListMember {
  employeeListId: number
  employeeNumber: string
  firstName?: string
  lastName?: string
  seniorityDate?: Date | string | null
  seniorityOrderNumber: number
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

  // Counts for search results
  crewsCount?: number
  employeesCount?: number
  equipmentCount?: number
  timesheetsCount?: number
  workOrdersCount?: number
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

  employeeNumber: string | null

  employeeFirstName?: string | null
  employeeLastName?: string | null

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
  timesheetColumnId: number
  timesheetRowId: number

  recordHours: number

  mappedPositionCode?: string | null
  mappedPayCode?: string | null
  mappedTimeCode?: string | null
  mappingConfidence: number
}

// Work Order Types

export interface WorkOrderTypeDefaultMilestone {
  dueDays?: number | null
  milestoneDescription: string
  milestoneTitle: string
  orderNumber: number
  workOrderTypeId: number
}

export interface WorkOrderType extends BaseRecord {
  defaultMilestones?: WorkOrderTypeDefaultMilestone[]
  dueDays?: number | null
  moreInfoFormNames?: string[]
  orderNumber: number
  userGroupId?: number | null
  userGroupName?: string
  workOrderNumberPrefix: string
  workOrderType: string
  workOrderTypeId: number
}

// Work Orders

export interface WorkOrder extends BaseRecord {
  workOrderId: number

  workOrderNumber: string
  workOrderNumberOverride?: string | null
  workOrderNumberPrefix: string
  workOrderNumberYear: number
  workOrderNumberSequence: number

  workOrderTypeId: number
  workOrderType?: string

  workOrderStatusDataListItemId?: number | null
  workOrderStatusDataListItem?: string

  workOrderPriorityDataListItemId?: number | null
  workOrderPriorityDataListItem?: string

  workOrderDetails: string

  workOrderOpenDateTime: Date | string

  workOrderDueDateTime?: Date | string | null
  workOrderCloseDateTime?: Date | string | null

  requestorName: string
  requestorContactInfo: string

  locationLatitude?: number | null
  locationLongitude?: number | null

  locationAddress1: string
  locationAddress2: string
  locationCityProvince: string

  assignedToId?: number | null
  assignedToName?: string

  moreInfoFormDataJson?: string
  moreInfoFormData?: Record<string, unknown>

  userGroupId?: number | null
  userGroupName?: string

  milestonesCount?: number
  milestonesCompletedCount?: number
  overdueMilestonesCount?: number

  attachmentsCount?: number
  thumbnailAttachmentId?: number | null

  notesCount?: number
  
  costsCount?: number
  costsTotal?: number

  tags?: WorkOrderTag[]
}

export interface WorkOrderTag {
  workOrderId: number

  tagName: string

  tagBackgroundColor?: string
  tagTextColor?: string
}

export interface WorkOrderMilestone extends BaseRecord {
  workOrderMilestoneId: number
  workOrderId: number

  milestoneTitle: string
  milestoneDescription: string

  milestoneDueDateTime?: Date | string | null
  milestoneCompleteDateTime?: Date | string | null

  assignedToId?: number | null
  assignedToName?: string

  orderNumber: number
}

export interface WorkOrderCost extends BaseRecord {
  workOrderCostId: number
  workOrderId: number

  costAmount: number
  costDescription: string
}

export interface WorkOrderAttachment extends BaseRecord {
  workOrderAttachmentId: number
  workOrderId: number

  attachmentFileName: string
  attachmentFileType: string
  attachmentFileSizeInBytes: number

  attachmentDescription: string

  isWorkOrderThumbnail: boolean

  fileSystemPath: string
}

// Ad Hoc Tasks

export interface AdhocTask extends BaseRecord {
  adhocTaskId: number

  adhocTaskTypeDataListItemId: number
  adhocTaskTypeDataListItem?: string

  taskDescription: string

  locationAddress1: string
  locationAddress2: string
  locationCityProvince: string
  locationLatitude?: number | null
  locationLongitude?: number | null

  fromLocationAddress1: string
  fromLocationAddress2: string
  fromLocationCityProvince: string
  fromLocationLatitude?: number | null
  fromLocationLongitude?: number | null

  toLocationAddress1: string
  toLocationAddress2: string
  toLocationCityProvince: string
  toLocationLatitude?: number | null
  toLocationLongitude?: number | null

  taskDueDateTime?: Date | string | null
  taskCompleteDateTime?: Date | string | null

  // For shift association
  shiftAdhocTaskNote?: string
  shiftsCount?: number
}

// Notification Configuration

export interface NotificationConfiguration extends BaseRecord {
  notificationConfigurationId: number
  notificationQueue: string
  notificationType: string
  notificationTypeFormJson: string
  assignedToId?: number | null
  assignedToName?: string
  isActive: boolean
}
