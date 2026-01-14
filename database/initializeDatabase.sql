create schema ShiftLog
GO

-- APPLICATION SETTINGS

CREATE TABLE ShiftLog.ApplicationSettings (
  instance varchar(20) not null,
  settingKey varchar(100) not null,
  settingValue varchar(500),
  previousSettingValue varchar(500),
  recordUpdate_dateTime datetime not null default getdate(),
  primary key (instance, settingKey)
)
GO

-- USERS

CREATE TABLE ShiftLog.Users (
  instance varchar(20) not null,
  userName varchar(30) not null,
  isActive bit not null default 1,

  shifts_canView bit not null default 0,
  shifts_canUpdate bit not null default 0,
  shifts_canManage bit not null default 0,

  workOrders_canView bit not null default 0,
  workOrders_canUpdate bit not null default 0,
  workOrders_canManage bit not null default 0,

  timesheets_canView bit not null default 0,
  timesheets_canUpdate bit not null default 0,
  timesheets_canManage bit not null default 0,

  isAdmin bit not null default 0,

  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),

  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),

  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,

  primary key (instance, userName)
)
GO

CREATE TABLE ShiftLog.UserSettings (
  instance varchar(20) not null,
  userName varchar(30) not null,
  settingKey varchar(100) not null,
  settingValue varchar(500),
  previousSettingValue varchar(500),
  recordUpdate_dateTime datetime not null default getdate(),
  primary key (instance, userName, settingKey),
  foreign key (instance, userName) references ShiftLog.Users(instance, userName)
)
GO

CREATE TABLE ShiftLog.UserGroups (
  userGroupId int not null primary key identity(1,1),
  instance varchar(20) not null,
  userGroupName varchar(50) not null,
  
  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime
)
GO

CREATE TABLE ShiftLog.UserGroupMembers (
  userGroupId int not null,
  instance varchar(20) not null,
  userName varchar(30) not null,

  primary key (userGroupId, userName),
  foreign key (userGroupId) references ShiftLog.UserGroups(userGroupId),
  foreign key (instance, userName) references ShiftLog.Users(instance, userName)
)
GO

-- API AUDIT LOG

CREATE TABLE ShiftLog.ApiAuditLog (
  auditLogId bigint not null primary key identity(1,1),
  instance varchar(20) not null,
  userName varchar(30),
  apiKey varchar(100),
  endpoint varchar(2000) not null,
  requestMethod varchar(10) not null,
  isValidApiKey bit not null,
  requestTime datetime not null default getdate(),
  ipAddress varchar(45),
  userAgent varchar(1000),
  responseStatus int,
  errorMessage varchar(1000)
)
GO

CREATE INDEX IX_ApiAuditLog_Instance_RequestTime 
  ON ShiftLog.ApiAuditLog(instance, requestTime DESC)
GO

CREATE INDEX IX_ApiAuditLog_UserName 
  ON ShiftLog.ApiAuditLog(userName, requestTime DESC) 
  WHERE userName IS NOT NULL
GO

-- DATALISTS

CREATE TABLE ShiftLog.DataLists (
  instance varchar(20) not null,
  dataListKey varchar(20) not null,
  dataListName varchar(50) not null,
  isSystemList bit not null default 0,
  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,
  primary key (instance, dataListKey)
)
GO

CREATE TABLE ShiftLog.DataListItems (
  dataListItemId int not null primary key identity(1,1),
  instance varchar(20) not null,
  dataListKey varchar(20) not null,
  dataListItem varchar(200) not null,
  orderNumber smallint not null default 0,
  userGroupId int,

  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,

  unique (instance, dataListKey, dataListItem),

  foreign key (instance, dataListKey) references ShiftLog.DataLists(instance, dataListKey),
  foreign key (userGroupId) references ShiftLog.UserGroups(userGroupId)
)
GO

-- TAGS

create table ShiftLog.Tags (
  tagName varchar(50) not null,
  instance varchar(20) not null,

  tagBackgroundColor char(6) not null default '000000',
  tagTextColor char(6) not null default 'FFFFFF',

  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,

  primary key (instance, tagName)
)
GO

-- EQUIPMENT

CREATE TABLE ShiftLog.EmployeeLists (
  employeeListId int not null primary key identity(1,1),
  instance varchar(20) not null,
  employeeListName varchar(50) not null,

  userGroupId int,

  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,

  foreign key (userGroupId) references ShiftLog.UserGroups(userGroupId)
)
GO

CREATE TABLE ShiftLog.Equipment (
  instance varchar(20) not null,
  equipmentNumber varchar(20) not null,
  equipmentName varchar(100) not null,
  equipmentDescription varchar(200) not null default '',

  equipmentTypeDataListItemId int not null,
  employeeListId int,
  userGroupId int,

  recordSync_isSynced bit not null default 0,
  recordSync_source varchar(20),
  recordSync_dateTime datetime,
  
  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,

  primary key (instance, equipmentNumber),
  foreign key (equipmentTypeDataListItemId) references ShiftLog.DataListItems(dataListItemId),
  foreign key (employeeListId) references ShiftLog.EmployeeLists(employeeListId),
  foreign key (userGroupId) references ShiftLog.UserGroups(userGroupId)
)
GO

-- EMPLOYEES

CREATE TABLE ShiftLog.Employees (
  instance varchar(20) not null,
  employeeNumber varchar(10) not null,

  firstName varchar(50) not null,
  lastName varchar(50) not null,
  
  userName varchar(30),
  isSupervisor bit not null default 0,

  phoneNumber varchar(20),
  phoneNumberAlternate varchar(20),
  emailAddress varchar(100),

  userGroupId int,

  recordSync_isSynced bit not null default 0,
  recordSync_source varchar(20),
  recordSync_dateTime datetime,

  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,

  primary key (instance, employeeNumber),
  foreign key (userGroupId) references ShiftLog.UserGroups(userGroupId)
)
GO

CREATE TABLE ShiftLog.Crews (
  crewId int not null primary key identity(1,1),
  instance varchar(20) not null,
  crewName varchar(50) not null,

  userGroupId int,

  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,

  foreign key (userGroupId) references ShiftLog.UserGroups(userGroupId)
)
GO

CREATE TABLE ShiftLog.CrewMembers (
  crewId int not null,
  instance varchar(20) not null,
  employeeNumber varchar(10) not null,
  primary key (crewId, employeeNumber),
  foreign key (crewId) references ShiftLog.Crews(crewId),
  foreign key (instance, employeeNumber) references ShiftLog.Employees(instance, employeeNumber)
)
GO

CREATE TABLE ShiftLog.CrewEquipment (
  crewId int not null,
  instance varchar(20) not null,
  equipmentNumber varchar(20) not null,
  employeeNumber varchar(10),
  primary key (crewId, equipmentNumber),
  foreign key (crewId) references ShiftLog.Crews(crewId),
  foreign key (instance, equipmentNumber) references ShiftLog.Equipment(instance, equipmentNumber)
)
GO

CREATE TABLE ShiftLog.EmployeeListMembers (
  employeeListId int not null,
  instance varchar(20) not null,
  employeeNumber varchar(10) not null,

  seniorityDate date,
  seniorityOrderNumber smallint not null default 0,

  primary key (employeeListId, employeeNumber),
  foreign key (employeeListId) references ShiftLog.EmployeeLists(employeeListId),
  foreign key (instance, employeeNumber) references ShiftLog.Employees(instance, employeeNumber)
)
GO

-- LOCATIONS

CREATE TABLE ShiftLog.Locations (
  locationId int not null primary key identity(1,1),

  instance varchar(20) not null,

  latitude decimal(10,7),
  longitude decimal(10,7),

  address1 varchar(100) not null default '',
  address2 varchar(100) not null default '',
  cityProvince varchar(50) not null default '',

  userGroupId int,

  recordSync_isSynced bit not null default 0,
  recordSync_source varchar(20),
  recordSync_dateTime datetime,

  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,

  foreign key (userGroupId) references ShiftLog.UserGroups(userGroupId)
)
GO

-- ASSIGNED TO

CREATE TABLE ShiftLog.AssignedTo (
  assignedToId int not null primary key identity(1,1),
  instance varchar(20) not null,
  assignedToName varchar(200) not null,
  orderNumber smallint not null default 0,
  userGroupId int,

  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,

  unique (instance, assignedToName),
  foreign key (userGroupId) references ShiftLog.UserGroups(userGroupId)
)
GO

-- WORK ORDER TYPES

CREATE TABLE ShiftLog.WorkOrderTypes (
  workOrderTypeId int not null primary key identity(1,1),
  instance varchar(20) not null,
  workOrderType varchar(100) not null,
  workOrderNumberPrefix varchar(10) not null default '',
  orderNumber smallint not null default 0,
  dueDays int,
  userGroupId int,

  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,

  foreign key (userGroupId) references ShiftLog.UserGroups(userGroupId)
)
GO

CREATE TABLE ShiftLog.WorkOrderTypeMilestones (
  workOrderTypeId int not null,
  milestoneTitle varchar(100) not null,
  milestoneDescription varchar(max) not null default '',
  dueDays int,
  orderNumber smallint not null default 0,

  primary key (workOrderTypeId, milestoneTitle),
  foreign key (workOrderTypeId) references ShiftLog.WorkOrderTypes(workOrderTypeId)
)
GO

CREATE TABLE ShiftLog.WorkOrderTypeMoreInfoForms (
  workOrderTypeId int not null,
  formName varchar(100) not null,

  primary key (workOrderTypeId, formName),
  foreign key (workOrderTypeId) references ShiftLog.WorkOrderTypes(workOrderTypeId)
)
GO

-- WORK ORDERS

create table ShiftLog.WorkOrders (
  workOrderId int not null primary key identity(1,1),
  
  workOrderTypeId int not null,

  instance varchar(20) not null,
  workOrderNumberPrefix varchar(10) not null,
  workOrderNumberYear smallint not null,
  workOrderNumberSequence int not null,

  workOrderNumberOverride varchar(50) not null default '',

  workOrderNumber as 
    case 
      when workOrderNumberOverride <> '' then workOrderNumberOverride
      else 
        concat(
          workOrderNumberPrefix,
          right('0000' + cast(workOrderNumberYear as varchar(4)), 4),
          '-',
          right('00000' +  cast(workOrderNumberSequence as varchar(5)), 5)
        )
    end PERSISTED,

  workOrderStatusDataListItemId int,
  workOrderPriorityDataListItemId int,

  workOrderDetails varchar(max) not null default '',

  workOrderOpenDateTime datetime not null,
  workOrderDueDateTime datetime,
  workOrderCloseDateTime datetime,

  requestorName varchar(100) not null default '',
  requestorContactInfo varchar(100) not null default '',

  locationLatitude decimal(10,7),
  locationLongitude decimal(10,7),

  locationAddress1 varchar(100) not null default '',
  locationAddress2 varchar(100) not null default '',
  locationCityProvince varchar(50) not null default '',

  assignedToId int,

  moreInfoFormDataJson nvarchar(max) not null default '{}',

  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,

  unique (instance, workOrderNumberPrefix, workOrderNumberYear, workOrderNumberSequence, workOrderNumberOverride),
  foreign key (workOrderTypeId) references ShiftLog.WorkOrderTypes(workOrderTypeId),
  foreign key (workOrderStatusDataListItemId) references ShiftLog.DataListItems(dataListItemId),
  foreign key (workOrderPriorityDataListItemId) references ShiftLog.DataListItems(dataListItemId),
  foreign key (assignedToId) references ShiftLog.AssignedTo(assignedToId)
)
GO

create table ShiftLog.WorkOrderTags (
  workOrderId int not null,
  tagName varchar(50) not null,

  primary key (workOrderId, tagName),
  foreign key (workOrderId) references ShiftLog.WorkOrders(workOrderId)
)
GO

create table ShiftLog.WorkOrderNotes (
  workOrderId int not null,
  noteSequence int not null,

  noteText varchar(max) not null,

  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,

  primary key (workOrderId, noteSequence),
  foreign key (workOrderId) references ShiftLog.WorkOrders(workOrderId)
)
GO

create table ShiftLog.WorkOrderMilestones (
  workOrderMilestoneId int not null primary key identity(1,1),
  workOrderId int not null,

  milestoneTitle varchar(100) not null default '',
  milestoneDescription varchar(max) not null default '',

  milestoneDueDateTime datetime,
  milestoneCompleteDateTime datetime,

  assignedToId int,

  orderNumber smallint not null default 0,

  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,

  foreign key (workOrderId) references ShiftLog.WorkOrders(workOrderId),
  foreign key (assignedToId) references ShiftLog.AssignedTo(assignedToId)
)
GO

create table ShiftLog.WorkOrderAttachments (
  workOrderAttachmentId int not null primary key identity(1,1),
  workOrderId int not null,

  attachmentFileName varchar(200) not null,
  attachmentFileType varchar(100) not null,
  attachmentFileSizeInBytes int not null,

  attachmentDescription varchar(200) not null default '',

  isWorkOrderThumbnail bit not null default 0,

  fileSystemPath varchar(500) not null,

  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,

  foreign key (workOrderId) references ShiftLog.WorkOrders(workOrderId)
)
GO

create table ShiftLog.WorkOrderCosts (
  workOrderCostId int not null primary key identity(1,1),
  workOrderId int not null,

  costAmount decimal(18,2) not null default 0,
  costDescription varchar(200) not null default '',

  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,

  foreign key (workOrderId) references ShiftLog.WorkOrders(workOrderId)
)
GO

-- SHIFTS

CREATE TABLE ShiftLog.Shifts (
  shiftId int not null primary key identity(1,1),

  instance varchar(20) not null,
  supervisorEmployeeNumber varchar(10) not null,

  shiftDate date not null,
  shiftTimeDataListItemId int not null,

  shiftDescription varchar(200) not null default '',

  shiftTypeDataListItemId int not null,

  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordLock_dateTime datetime,
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,

  foreign key (instance, supervisorEmployeeNumber) references ShiftLog.Employees(instance, employeeNumber),
  foreign key (shiftTimeDataListItemId) references ShiftLog.DataListItems(dataListItemId),
  foreign key (shiftTypeDataListItemId) references ShiftLog.DataListItems(dataListItemId)
)
GO

create table ShiftLog.ShiftCrews (
  shiftId int not null,
  crewId int not null,
  shiftCrewNote varchar(200) not null default '',

  primary key (shiftId, crewId),
  foreign key (shiftId) references ShiftLog.Shifts(shiftId),
  foreign key (crewId) references ShiftLog.Crews(crewId)
)
GO

CREATE TABLE ShiftLog.ShiftEmployees (
  shiftId int not null,
  instance varchar(20) not null,

  employeeNumber varchar(10) not null,
  crewId int,
  shiftEmployeeNote varchar(200) not null default '',

  primary key (shiftId, employeeNumber),
  foreign key (shiftId) references ShiftLog.Shifts(shiftId),
  foreign key (instance, employeeNumber) references ShiftLog.Employees(instance, employeeNumber),
  foreign key (crewId) references ShiftLog.Crews(crewId)
)
GO

create table ShiftLog.ShiftEquipment (
  shiftId int not null,
  instance varchar(20) not null,

  equipmentNumber varchar(20) not null,
  employeeNumber varchar(10),
  shiftEquipmentNote varchar(200) not null default '',

  primary key (shiftId, equipmentNumber),
  foreign key (shiftId) references ShiftLog.Shifts(shiftId),
  foreign key (instance, equipmentNumber) references ShiftLog.Equipment(instance, equipmentNumber),
  foreign key (instance, employeeNumber) references ShiftLog.Employees(instance, employeeNumber)
)
GO

create table ShiftLog.ShiftWorkOrders (
  shiftId int not null,
  workOrderId int not null,
  shiftWorkOrderNote varchar(200) not null default '',

  primary key (shiftId, workOrderId),
  foreign key (shiftId) references ShiftLog.Shifts(shiftId),
  foreign key (workOrderId) references ShiftLog.WorkOrders(workOrderId)
)
GO

create table ShiftLog.AdhocTasks (
  adhocTaskId int not null primary key identity(1,1),

  adhocTaskTypeDataListItemId int not null,
  taskDescription varchar(200) not null default '',

  locationAddress1 varchar(100) not null default '',
  locationAddress2 varchar(100) not null default '',
  locationCityProvince varchar(50) not null default '',
  locationLatitude decimal(10,7),
  locationLongitude decimal(10,7),

  fromLocationAddress1 varchar(100) not null default '',
  fromLocationAddress2 varchar(100) not null default '',
  fromLocationCityProvince varchar(50) not null default '',
  fromLocationLatitude decimal(10,7),
  fromLocationLongitude decimal(10,7),

  toLocationAddress1 varchar(100) not null default '',
  toLocationAddress2 varchar(100) not null default '',
  toLocationCityProvince varchar(50) not null default '',
  toLocationLatitude decimal(10,7),
  toLocationLongitude decimal(10,7),

  taskDueDateTime datetime,
  taskCompleteDateTime datetime,

  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,

  foreign key (adhocTaskTypeDataListItemId) references ShiftLog.DataListItems(dataListItemId)
)
GO

create table ShiftLog.ShiftAdhocTasks (
  shiftId int not null,
  adhocTaskId int not null,
  shiftAdhocTaskNote varchar(200) not null default '',

  primary key (shiftId, adhocTaskId),
  foreign key (shiftId) references ShiftLog.Shifts(shiftId),
  foreign key (adhocTaskId) references ShiftLog.AdhocTasks(adhocTaskId)
)
GO

-- TIMESHEETS

CREATE TABLE ShiftLog.Timesheets (
  timesheetId int not null primary key identity(1,1),
  
  instance varchar(20) not null,
  supervisorEmployeeNumber varchar(10) not null,

  timesheetTypeDataListItemId int not null,
  timesheetTitle varchar(100) not null default '',
  timesheetNote varchar(200) not null default '',

  timesheetDate date not null,
  shiftId int,

  recordSubmitted_dateTime datetime,
  recordSubmitted_userName varchar(30),

  employeesEntered_dateTime datetime,
  employeesEntered_userName varchar(30),

  equipmentEntered_dateTime datetime,
  equipmentEntered_userName varchar(30),

  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,

  foreign key (instance, supervisorEmployeeNumber) references ShiftLog.Employees(instance, employeeNumber),
  foreign key (timesheetTypeDataListItemId) references ShiftLog.DataListItems(dataListItemId)
)
GO

CREATE TABLE ShiftLog.TimesheetColumns (
  timesheetColumnId int not null primary key identity(1,1),
  timesheetId int not null,
  columnTitle varchar(50) not null default '',

  workOrderNumber varchar(20),
  costCenterA varchar(20),
  costCenterB varchar(20),  
  
  orderNumber smallint not null default 0,

  foreign key (timesheetId) references ShiftLog.Timesheets(timesheetId)
)
GO

CREATE TABLE ShiftLog.TimesheetRows (
  timesheetRowId int not null primary key identity(1,1),
  instance varchar(20) not null,
  timesheetId int not null,
  rowTitle varchar(50) not null default '',

  employeeNumber varchar(10),
  equipmentNumber varchar(20),

  jobClassificationDataListItemId int,
  timeCodeDataListItemId int,  

  foreign key (timesheetId) references ShiftLog.Timesheets(timesheetId),
  foreign key (instance, employeeNumber) references ShiftLog.Employees(instance, employeeNumber),
  foreign key (instance, equipmentNumber) references ShiftLog.Equipment(instance, equipmentNumber),
  foreign key (jobClassificationDataListItemId) references ShiftLog.DataListItems(dataListItemId),
  foreign key (timeCodeDataListItemId) references ShiftLog.DataListItems(dataListItemId)
)
GO

CREATE TABLE ShiftLog.TimesheetCells (
  timesheetRowId int not null,
  timesheetColumnId int not null,

  recordHours decimal(10,2) not null default 0,

  mappedPositionCode varchar(20),
  mappedPayCode varchar(20),
  mappedTimeCode varchar(20),
  mappingConfidence tinyint not null default 0,

  primary key (timesheetRowId, timesheetColumnId),
  foreign key (timesheetRowId) references ShiftLog.TimesheetRows(timesheetRowId),
  foreign key (timesheetColumnId) references ShiftLog.TimesheetColumns(timesheetColumnId)
)
GO

-- NOTIFICATIONS

CREATE TABLE ShiftLog.NotificationConfigurations (
  notificationConfigurationId int not null primary key identity(1,1),
  instance varchar(20) not null,

  notificationQueue varchar(50) not null,
  notificationType varchar(50) not null,
  notificationTypeFormJson nvarchar(max) not null,

  assignedToId int,

  isActive bit not null default 1,

  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,

  foreign key (assignedToId) references ShiftLog.AssignedTo(assignedToId)
)
GO

CREATE TABLE ShiftLog.NotificationLogs (
  notificationLogId bigint not null primary key identity(1,1),

  notificationConfigurationId int not null,
  recordId int not null,

  notificationDateTime datetime not null default getdate(),
  isSuccess bit not null,
  errorMessage varchar(1000) not null default '',

  foreign key (notificationConfigurationId) references ShiftLog.NotificationConfigurations(notificationConfigurationId)
)
GO