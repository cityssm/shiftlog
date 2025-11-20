create schema ShiftLog
GO

-- APPLICATION SETTINGS

CREATE TABLE ShiftLog.ApplicationSettings (
  settingKey varchar(100) not null primary key,
  settingValue varchar(500),
  previousSettingValue varchar(500),
  recordUpdate_dateTime datetime not null default getdate()
)
GO

-- USERS

CREATE TABLE ShiftLog.Users (
  userName varchar(30) not null primary key,
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
  recordDelete_dateTime datetime
)
GO

insert into ShiftLog.Users (
  userName, isActive,
  shifts_canView, shifts_canUpdate, shifts_canManage,
  workOrders_canView, workOrders_canUpdate, workOrders_canManage,
  timesheets_canView, timesheets_canUpdate, timesheets_canManage,
  isAdmin,
  recordCreate_userName, recordUpdate_userName
)
values (
  'administrator', 1,
  1, 0, 1,
  1, 0, 1,
  1, 0, 1,
  1,
  'initializeDatabase.sql', 'initializeDatabase.sql'
)
GO

CREATE TABLE ShiftLog.UserSettings (
  userName varchar(30) not null,
  settingKey varchar(100) not null,
  settingValue varchar(500),
  previousSettingValue varchar(500),
  recordUpdate_dateTime datetime not null default getdate(),
  primary key (userName, settingKey),
  foreign key (userName) references ShiftLog.Users(userName)
)
GO

CREATE TABLE ShiftLog.UserGroups (
  userGroupId int not null primary key identity(1,1),
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
  userName varchar(30) not null,

  primary key (userGroupId, userName),
  foreign key (userGroupId) references ShiftLog.UserGroups(userGroupId),
  foreign key (userName) references ShiftLog.Users(userName)
)
GO

-- DATALISTS

CREATE TABLE ShiftLog.DataLists (
  dataListKey varchar(20) not null primary key,
  dataListName varchar(50) not null,
  isSystemList bit not null default 0,
  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime
)
GO

CREATE TABLE ShiftLog.DataListItems (
  dataListItemId int not null primary key identity(1,1),
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

  unique (dataListKey, dataListItem),

  foreign key (dataListKey) references ShiftLog.DataLists(dataListKey),
  foreign key (userGroupId) references ShiftLog.UserGroups(userGroupId)
)
GO

-- EMPLOYEES

CREATE TABLE ShiftLog.Employees (
  employeeNumber varchar(10) not null primary key,
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

  foreign key (userGroupId) references ShiftLog.UserGroups(userGroupId)
)
GO

CREATE TABLE ShiftLog.Crews (
  crewId int not null primary key identity(1,1),
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
  employeeNumber varchar(10) not null,
  primary key (crewId, employeeNumber),
  foreign key (crewId) references ShiftLog.Crews(crewId),
  foreign key (employeeNumber) references ShiftLog.Employees(employeeNumber)
)
GO

-- EQUIPMENT

CREATE TABLE ShiftLog.Equipment (
  equipmentNumber varchar(20) not null primary key,
  equipmentName varchar(100) not null,
  equipmentDescription varchar(200) not null default '',

  equipmentTypeDataListItemId int not null,
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

  foreign key (equipmentTypeDataListItemId) references ShiftLog.DataListItems(dataListItemId),
  foreign key (userGroupId) references ShiftLog.UserGroups(userGroupId)
)
GO

insert into ShiftLog.DataLists (
  dataListKey,
  dataListName,
  isSystemList,
  recordCreate_userName,
  recordUpdate_userName
)
values (
  'equipmentTypes',
  'Equipment Types',
  1,
  'initializeDatabase.sql',
  'initializeDatabase.sql'
)
GO

-- WORK ORDERS

create table ShiftLog.WorkOrders (
  workOrderId int not null primary key identity(1,1),
  
  workOrderNumberYear smallint not null,
  workOrderNumberSequence int not null,
  workOrderNumber as (cast(workOrderNumberYear as varchar(4)) + '-' + right('000000' + cast(workOrderNumberSequence as varchar(6)),6)) persisted,

  workOrderTypeDataListItemId int not null,
  workOrderStatusDataListItemId int,
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

  assignedToDataListItemId int,

  recordCreate_userName varchar(30) not null,
  recordCreate_dateTime datetime not null default getdate(),
  recordUpdate_userName varchar(30) not null,
  recordUpdate_dateTime datetime not null default getdate(),
  recordDelete_userName varchar(30),
  recordDelete_dateTime datetime,

  unique (workOrderNumberYear, workOrderNumberSequence),
  foreign key (userGroupId) references ShiftLog.UserGroups(userGroupId),
  foreign key (workOrderTypeDataListItemId) references ShiftLog.DataListItems(dataListItemId),
  foreign key (workOrderStatusDataListItemId) references ShiftLog.DataListItems(dataListItemId),
  foreign key (assignedToDataListItemId) references ShiftLog.DataListItems(dataListItemId)
)
GO

insert into ShiftLog.DataLists (
  dataListKey,
  dataListName,
  isSystemList,
  recordCreate_userName,
  recordUpdate_userName
)
values (
  'workOrderTypes',
  'Work Order Types',
  1,
  'initializeDatabase.sql',
  'initializeDatabase.sql'
)
GO

insert into ShiftLog.DataLists (
  dataListKey,
  dataListName,
  isSystemList,
  recordCreate_userName,
  recordUpdate_userName
)
values (
  'workOrderStatuses',
  'Work Order Statuses',
  1,
  'initializeDatabase.sql',
  'initializeDatabase.sql'
)
GO

insert into ShiftLog.DataLists (
  dataListKey,
  dataListName,
  isSystemList,
  recordCreate_userName,
  recordUpdate_userName
)
values (
  'assignedTo',
  'Assigned To',
  1,
  'initializeDatabase.sql',
  'initializeDatabase.sql'
)
GO

-- SHIFTS

CREATE TABLE ShiftLog.Shifts (
  shiftId int not null primary key identity(1,1),
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

  foreign key (supervisorEmployeeNumber) references ShiftLog.Employees(employeeNumber),
  foreign key (shiftTimeDataListItemId) references ShiftLog.DataListItems(dataListItemId),
  foreign key (shiftTypeDataListItemId) references ShiftLog.DataListItems(dataListItemId)
)
GO

insert into ShiftLog.DataLists (
  dataListKey,
  dataListName,
  isSystemList,
  recordCreate_userName,
  recordUpdate_userName
)
values (
  'shiftTimes',
  'Shift Times',
  1,
  'initializeDatabase.sql',
  'initializeDatabase.sql'
)
GO

insert into ShiftLog.DataLists (
  dataListKey,
  dataListName,
  isSystemList,
  recordCreate_userName,
  recordUpdate_userName
)
values (
  'shiftTypes',
  'Shift Types',
  1,
  'initializeDatabase.sql',
  'initializeDatabase.sql'
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
  employeeNumber varchar(10) not null,
  crewId int,
  shiftEmployeeNote varchar(200) not null default '',

  primary key (shiftId, employeeNumber),
  foreign key (shiftId) references ShiftLog.Shifts(shiftId),
  foreign key (employeeNumber) references ShiftLog.Employees(employeeNumber),
  foreign key (crewId) references ShiftLog.Crews(crewId)
)
GO

create table ShiftLog.ShiftEquipment (
  shiftId int not null,
  equipmentNumber varchar(20) not null,
  employeeNumber varchar(10),
  shiftEquipmentNote varchar(200) not null default '',

  primary key (shiftId, equipmentNumber),
  foreign key (shiftId) references ShiftLog.Shifts(shiftId),
  foreign key (equipmentNumber) references ShiftLog.Equipment(equipmentNumber),
  foreign key (employeeNumber) references ShiftLog.Employees(employeeNumber)
)
GO

-- TIMESHEETS

CREATE TABLE ShiftLog.Timesheets (
  timesheetId int not null primary key identity(1,1),
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

  foreign key (supervisorEmployeeNumber) references ShiftLog.Employees(employeeNumber),
  foreign key (timesheetTypeDataListItemId) references ShiftLog.DataListItems(dataListItemId)
)
GO

insert into ShiftLog.DataLists (
  dataListKey,
  dataListName,
  isSystemList,
  recordCreate_userName,
  recordUpdate_userName
)
values (
  'timesheetTypes',
  'Timesheet Types',
  1,
  'initializeDatabase.sql',
  'initializeDatabase.sql'
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
  timesheetId int not null,
  rowTitle varchar(50) not null default '',

  employeeNumber varchar(10),
  equipmentNumber varchar(20),

  jobClassificationDataListItemId int,
  timeCodeDataListItemId int,  

  foreign key (timesheetId) references ShiftLog.Timesheets(timesheetId),
  foreign key (employeeNumber) references ShiftLog.Employees(employeeNumber),
  foreign key (equipmentNumber) references ShiftLog.Equipment(equipmentNumber),
  foreign key (jobClassificationDataListItemId) references ShiftLog.DataListItems(dataListItemId),
  foreign key (timeCodeDataListItemId) references ShiftLog.DataListItems(dataListItemId)
)
GO

insert into ShiftLog.DataLists (
  dataListKey,
  dataListName,
  isSystemList,
  recordCreate_userName,
  recordUpdate_userName
)
values (
  'jobClassifications',
  'Timesheet Job Classification',
  1,
  'initializeDatabase.sql',
  'initializeDatabase.sql'
)
GO

insert into ShiftLog.DataLists (
  dataListKey,
  dataListName,
  isSystemList,
  recordCreate_userName,
  recordUpdate_userName
)
values (
  'timeCodes',
  'Timesheet Time Codes',
  1,
  'initializeDatabase.sql',
  'initializeDatabase.sql'
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