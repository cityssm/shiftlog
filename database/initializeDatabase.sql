CREATE
SCHEMA ShiftLog
GO
--
-- APPLICATION SETTINGS
--
CREATE TABLE ShiftLog.ApplicationSettings (
  instance VARCHAR(20) NOT NULL,
  settingKey VARCHAR(100) NOT NULL,
  settingValue VARCHAR(500),
  previousSettingValue VARCHAR(500),
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  PRIMARY KEY (instance, settingKey)
)
GO
--
-- USERS
--
CREATE TABLE ShiftLog.Users (
  instance VARCHAR(20) NOT NULL,
  userName VARCHAR(30) NOT NULL,
  isActive BIT NOT NULL DEFAULT 1,
  shifts_canView BIT NOT NULL DEFAULT 0,
  shifts_canUpdate BIT NOT NULL DEFAULT 0,
  shifts_canManage BIT NOT NULL DEFAULT 0,
  workOrders_canView BIT NOT NULL DEFAULT 0,
  workOrders_canUpdate BIT NOT NULL DEFAULT 0,
  workOrders_canManage BIT NOT NULL DEFAULT 0,
  timesheets_canView BIT NOT NULL DEFAULT 0,
  timesheets_canUpdate BIT NOT NULL DEFAULT 0,
  timesheets_canManage BIT NOT NULL DEFAULT 0,
  isAdmin BIT NOT NULL DEFAULT 0,
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime,
  PRIMARY KEY (instance, userName)
)
GO
CREATE TABLE ShiftLog.UserSettings (
  instance VARCHAR(20) NOT NULL,
  userName VARCHAR(30) NOT NULL,
  settingKey VARCHAR(100) NOT NULL,
  settingValue VARCHAR(500),
  previousSettingValue VARCHAR(500),
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  PRIMARY KEY (instance, userName, settingKey),
  FOREIGN KEY (instance, userName) REFERENCES ShiftLog.Users (instance, userName)
)
GO
CREATE TABLE ShiftLog.UserGroups (
  userGroupId INT NOT NULL PRIMARY KEY identity(1, 1),
  instance VARCHAR(20) NOT NULL,
  userGroupName VARCHAR(50) NOT NULL,
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime
)
GO
CREATE TABLE ShiftLog.UserGroupMembers (
  userGroupId INT NOT NULL,
  instance VARCHAR(20) NOT NULL,
  userName VARCHAR(30) NOT NULL,
  PRIMARY KEY (userGroupId, userName),
  FOREIGN KEY (userGroupId) REFERENCES ShiftLog.UserGroups (userGroupId),
  FOREIGN KEY (instance, userName) REFERENCES ShiftLog.Users (instance, userName)
)
GO
--
-- API AUDIT LOG
--
CREATE TABLE ShiftLog.ApiAuditLog (
  auditLogId bigint NOT NULL PRIMARY KEY identity(1, 1),
  instance VARCHAR(20) NOT NULL,
  userName VARCHAR(30),
  apiKey VARCHAR(100),
  ENDPOINT VARCHAR(2000) NOT NULL,
  requestMethod VARCHAR(10) NOT NULL,
  isValidApiKey BIT NOT NULL,
  requestTime datetime NOT NULL DEFAULT getdate(),
  ipAddress VARCHAR(45),
  userAgent VARCHAR(1000),
  responseStatus INT,
  errorMessage VARCHAR(1000)
)
GO
CREATE INDEX IX_ApiAuditLog_Instance_RequestTime ON ShiftLog.ApiAuditLog (instance, requestTime DESC)
GO
CREATE INDEX IX_ApiAuditLog_UserName ON ShiftLog.ApiAuditLog (userName, requestTime DESC)
WHERE
  userName IS NOT NULL
GO
--
-- DATALISTS
--
CREATE TABLE ShiftLog.DataLists (
  instance VARCHAR(20) NOT NULL,
  dataListKey VARCHAR(20) NOT NULL,
  dataListName VARCHAR(50) NOT NULL,
  isSystemList BIT NOT NULL DEFAULT 0,
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime,
  PRIMARY KEY (instance, dataListKey)
)
GO
CREATE TABLE ShiftLog.DataListItems (
  dataListItemId INT NOT NULL PRIMARY KEY identity(1, 1),
  instance VARCHAR(20) NOT NULL,
  dataListKey VARCHAR(20) NOT NULL,
  dataListItem VARCHAR(200) NOT NULL,
  orderNumber SMALLINT NOT NULL DEFAULT 0,
  userGroupId INT,
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime,
  UNIQUE (instance, dataListKey, dataListItem),
  FOREIGN KEY (instance, dataListKey) REFERENCES ShiftLog.DataLists (instance, dataListKey),
  FOREIGN KEY (userGroupId) REFERENCES ShiftLog.UserGroups (userGroupId)
)
GO
--
-- TAGS
--
CREATE TABLE ShiftLog.Tags (
  tagName VARCHAR(50) NOT NULL,
  instance VARCHAR(20) NOT NULL,
  tagBackgroundColor CHAR(6) NOT NULL DEFAULT '000000',
  tagTextColor CHAR(6) NOT NULL DEFAULT 'FFFFFF',
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime,
  PRIMARY KEY (instance, tagName)
)
GO
--
-- EQUIPMENT
--
CREATE TABLE ShiftLog.EmployeeLists (
  employeeListId INT NOT NULL PRIMARY KEY identity(1, 1),
  instance VARCHAR(20) NOT NULL,
  employeeListName VARCHAR(50) NOT NULL,
  userGroupId INT,
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime,
  FOREIGN KEY (userGroupId) REFERENCES ShiftLog.UserGroups (userGroupId)
)
GO
CREATE TABLE ShiftLog.Equipment (
  instance VARCHAR(20) NOT NULL,
  equipmentNumber VARCHAR(20) NOT NULL,
  equipmentName VARCHAR(100) NOT NULL,
  equipmentDescription VARCHAR(200) NOT NULL DEFAULT '',
  equipmentTypeDataListItemId INT NOT NULL,
  employeeListId INT,
  userGroupId INT,
  recordSync_isSynced BIT NOT NULL DEFAULT 0,
  recordSync_source VARCHAR(20),
  recordSync_dateTime datetime,
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime,
  PRIMARY KEY (instance, equipmentNumber),
  FOREIGN KEY (equipmentTypeDataListItemId) REFERENCES ShiftLog.DataListItems (dataListItemId),
  FOREIGN KEY (employeeListId) REFERENCES ShiftLog.EmployeeLists (employeeListId),
  FOREIGN KEY (userGroupId) REFERENCES ShiftLog.UserGroups (userGroupId)
)
GO
--
-- EMPLOYEES
--
CREATE TABLE ShiftLog.Employees (
  instance VARCHAR(20) NOT NULL,
  employeeNumber VARCHAR(10) NOT NULL,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  userName VARCHAR(30),
  isSupervisor BIT NOT NULL DEFAULT 0,
  phoneNumber VARCHAR(20),
  phoneNumberAlternate VARCHAR(20),
  emailAddress VARCHAR(100),
  userGroupId INT,
  recordSync_isSynced BIT NOT NULL DEFAULT 0,
  recordSync_source VARCHAR(20),
  recordSync_dateTime datetime,
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime,
  PRIMARY KEY (instance, employeeNumber),
  FOREIGN KEY (userGroupId) REFERENCES ShiftLog.UserGroups (userGroupId)
)
GO
CREATE TABLE ShiftLog.Crews (
  crewId INT NOT NULL PRIMARY KEY identity(1, 1),
  instance VARCHAR(20) NOT NULL,
  crewName VARCHAR(50) NOT NULL,
  userGroupId INT,
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime,
  FOREIGN KEY (userGroupId) REFERENCES ShiftLog.UserGroups (userGroupId)
)
GO
CREATE TABLE ShiftLog.CrewMembers (
  crewId INT NOT NULL,
  instance VARCHAR(20) NOT NULL,
  employeeNumber VARCHAR(10) NOT NULL,
  PRIMARY KEY (crewId, employeeNumber),
  FOREIGN KEY (crewId) REFERENCES ShiftLog.Crews (crewId),
  FOREIGN KEY (instance, employeeNumber) REFERENCES ShiftLog.Employees (instance, employeeNumber)
)
GO
CREATE TABLE ShiftLog.CrewEquipment (
  crewId INT NOT NULL,
  instance VARCHAR(20) NOT NULL,
  equipmentNumber VARCHAR(20) NOT NULL,
  employeeNumber VARCHAR(10),
  PRIMARY KEY (crewId, equipmentNumber),
  FOREIGN KEY (crewId) REFERENCES ShiftLog.Crews (crewId),
  FOREIGN KEY (instance, equipmentNumber) REFERENCES ShiftLog.Equipment (instance, equipmentNumber)
)
GO
CREATE TABLE ShiftLog.EmployeeListMembers (
  employeeListId INT NOT NULL,
  instance VARCHAR(20) NOT NULL,
  employeeNumber VARCHAR(10) NOT NULL,
  seniorityDate DATE,
  seniorityOrderNumber SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (employeeListId, employeeNumber),
  FOREIGN KEY (employeeListId) REFERENCES ShiftLog.EmployeeLists (employeeListId),
  FOREIGN KEY (instance, employeeNumber) REFERENCES ShiftLog.Employees (instance, employeeNumber)
)
GO
--
-- LOCATIONS
--
CREATE TABLE ShiftLog.Locations (
  locationId INT NOT NULL PRIMARY KEY identity(1, 1),
  instance VARCHAR(20) NOT NULL,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  address1 VARCHAR(100) NOT NULL DEFAULT '',
  address2 VARCHAR(100) NOT NULL DEFAULT '',
  cityProvince VARCHAR(50) NOT NULL DEFAULT '',
  recordSync_isSynced BIT NOT NULL DEFAULT 0,
  recordSync_source VARCHAR(20),
  recordSync_dateTime datetime,
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime
)
GO
--
-- ASSIGNED TO
--
CREATE TABLE ShiftLog.AssignedTo (
  assignedToId INT NOT NULL PRIMARY KEY identity(1, 1),
  instance VARCHAR(20) NOT NULL,
  assignedToName VARCHAR(200) NOT NULL,
  orderNumber SMALLINT NOT NULL DEFAULT 0,
  userGroupId INT,
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime,
  UNIQUE (instance, assignedToName),
  FOREIGN KEY (userGroupId) REFERENCES ShiftLog.UserGroups (userGroupId)
)
GO
--
-- WORK ORDER TYPES
--
CREATE TABLE ShiftLog.WorkOrderTypes (
  workOrderTypeId INT NOT NULL PRIMARY KEY identity(1, 1),
  instance VARCHAR(20) NOT NULL,
  workOrderType VARCHAR(100) NOT NULL,
  workOrderNumberPrefix VARCHAR(10) NOT NULL DEFAULT '',
  orderNumber SMALLINT NOT NULL DEFAULT 0,
  dueDays INT,
  userGroupId INT,
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime,
  FOREIGN KEY (userGroupId) REFERENCES ShiftLog.UserGroups (userGroupId)
)
GO
CREATE TABLE ShiftLog.WorkOrderTypeMilestones (
  workOrderTypeId INT NOT NULL,
  milestoneTitle VARCHAR(100) NOT NULL,
  milestoneDescription VARCHAR(max) NOT NULL DEFAULT '',
  dueDays INT,
  orderNumber SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (workOrderTypeId, milestoneTitle),
  FOREIGN KEY (workOrderTypeId) REFERENCES ShiftLog.WorkOrderTypes (workOrderTypeId)
)
GO
CREATE TABLE ShiftLog.WorkOrderTypeMoreInfoForms (
  workOrderTypeId INT NOT NULL,
  formName VARCHAR(100) NOT NULL,
  PRIMARY KEY (workOrderTypeId, formName),
  FOREIGN KEY (workOrderTypeId) REFERENCES ShiftLog.WorkOrderTypes (workOrderTypeId)
)
GO
--
-- WORK ORDERS
--
CREATE TABLE ShiftLog.WorkOrders (
  workOrderId INT NOT NULL PRIMARY KEY identity(1, 1),
  workOrderTypeId INT NOT NULL,
  instance VARCHAR(20) NOT NULL,
  workOrderNumberPrefix VARCHAR(10) NOT NULL,
  workOrderNumberYear SMALLINT NOT NULL,
  workOrderNumberSequence INT NOT NULL,
  workOrderNumberOverride VARCHAR(50) NOT NULL DEFAULT '',
  workOrderNumber AS CASE
    WHEN workOrderNumberOverride <> '' THEN workOrderNumberOverride
    ELSE concat(
      workOrderNumberPrefix,
      right(
        '0000' + cast(workOrderNumberYear AS VARCHAR(4)),
        4
      ),
      '-',
      right(
        '00000' + cast(workOrderNumberSequence AS VARCHAR(5)),
        5
      )
    )
  END PERSISTED,
  workOrderStatusDataListItemId INT,
  workOrderPriorityDataListItemId INT,
  workOrderDetails VARCHAR(max) NOT NULL DEFAULT '',
  workOrderOpenDateTime datetime NOT NULL,
  workOrderDueDateTime datetime,
  workOrderCloseDateTime datetime,
  requestorName VARCHAR(100) NOT NULL DEFAULT '',
  requestorContactInfo VARCHAR(100) NOT NULL DEFAULT '',
  locationLatitude DECIMAL(10, 7),
  locationLongitude DECIMAL(10, 7),
  locationAddress1 VARCHAR(100) NOT NULL DEFAULT '',
  locationAddress2 VARCHAR(100) NOT NULL DEFAULT '',
  locationCityProvince VARCHAR(50) NOT NULL DEFAULT '',
  assignedToId INT,
  moreInfoFormDataJson NVARCHAR(max) NOT NULL DEFAULT '{}',
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime,
  UNIQUE (
    instance,
    workOrderNumberPrefix,
    workOrderNumberYear,
    workOrderNumberSequence,
    workOrderNumberOverride
  ),
  FOREIGN KEY (workOrderTypeId) REFERENCES ShiftLog.WorkOrderTypes (workOrderTypeId),
  FOREIGN KEY (workOrderStatusDataListItemId) REFERENCES ShiftLog.DataListItems (dataListItemId),
  FOREIGN KEY (workOrderPriorityDataListItemId) REFERENCES ShiftLog.DataListItems (dataListItemId),
  FOREIGN KEY (assignedToId) REFERENCES ShiftLog.AssignedTo (assignedToId)
)
GO
CREATE TABLE ShiftLog.WorkOrderTags (
  workOrderId INT NOT NULL,
  tagName VARCHAR(50) NOT NULL,
  PRIMARY KEY (workOrderId, tagName),
  FOREIGN KEY (workOrderId) REFERENCES ShiftLog.WorkOrders (workOrderId)
)
GO
CREATE TABLE ShiftLog.WorkOrderNotes (
  workOrderId INT NOT NULL,
  noteSequence INT NOT NULL,
  noteText VARCHAR(max) NOT NULL,
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime,
  PRIMARY KEY (workOrderId, noteSequence),
  FOREIGN KEY (workOrderId) REFERENCES ShiftLog.WorkOrders (workOrderId)
)
GO
CREATE TABLE ShiftLog.WorkOrderMilestones (
  workOrderMilestoneId INT NOT NULL PRIMARY KEY identity(1, 1),
  workOrderId INT NOT NULL,
  milestoneTitle VARCHAR(100) NOT NULL DEFAULT '',
  milestoneDescription VARCHAR(max) NOT NULL DEFAULT '',
  milestoneDueDateTime datetime,
  milestoneCompleteDateTime datetime,
  assignedToId INT,
  orderNumber SMALLINT NOT NULL DEFAULT 0,
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime,
  FOREIGN KEY (workOrderId) REFERENCES ShiftLog.WorkOrders (workOrderId),
  FOREIGN KEY (assignedToId) REFERENCES ShiftLog.AssignedTo (assignedToId)
)
GO
CREATE TABLE ShiftLog.WorkOrderAttachments (
  workOrderAttachmentId INT NOT NULL PRIMARY KEY identity(1, 1),
  workOrderId INT NOT NULL,
  attachmentFileName VARCHAR(200) NOT NULL,
  attachmentFileType VARCHAR(100) NOT NULL,
  attachmentFileSizeInBytes INT NOT NULL,
  attachmentDescription VARCHAR(200) NOT NULL DEFAULT '',
  isWorkOrderThumbnail BIT NOT NULL DEFAULT 0,
  fileSystemPath VARCHAR(500) NOT NULL,
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime,
  FOREIGN KEY (workOrderId) REFERENCES ShiftLog.WorkOrders (workOrderId)
)
GO
CREATE TABLE ShiftLog.WorkOrderCosts (
  workOrderCostId INT NOT NULL PRIMARY KEY identity(1, 1),
  workOrderId INT NOT NULL,
  costAmount DECIMAL(18, 2) NOT NULL DEFAULT 0,
  costDescription VARCHAR(200) NOT NULL DEFAULT '',
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime,
  FOREIGN KEY (workOrderId) REFERENCES ShiftLog.WorkOrders (workOrderId)
)
GO
--
-- SHIFTS
--
CREATE TABLE ShiftLog.Shifts (
  shiftId INT NOT NULL PRIMARY KEY identity(1, 1),
  instance VARCHAR(20) NOT NULL,
  supervisorEmployeeNumber VARCHAR(10) NOT NULL,
  shiftDate DATE NOT NULL,
  shiftTimeDataListItemId INT NOT NULL,
  shiftDescription VARCHAR(200) NOT NULL DEFAULT '',
  shiftTypeDataListItemId INT NOT NULL,
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordLock_dateTime datetime,
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime,
  FOREIGN KEY (instance, supervisorEmployeeNumber) REFERENCES ShiftLog.Employees (instance, employeeNumber),
  FOREIGN KEY (shiftTimeDataListItemId) REFERENCES ShiftLog.DataListItems (dataListItemId),
  FOREIGN KEY (shiftTypeDataListItemId) REFERENCES ShiftLog.DataListItems (dataListItemId)
)
GO
CREATE TABLE ShiftLog.ShiftCrews (
  shiftId INT NOT NULL,
  crewId INT NOT NULL,
  shiftCrewNote VARCHAR(200) NOT NULL DEFAULT '',
  PRIMARY KEY (shiftId, crewId),
  FOREIGN KEY (shiftId) REFERENCES ShiftLog.Shifts (shiftId),
  FOREIGN KEY (crewId) REFERENCES ShiftLog.Crews (crewId)
)
GO
CREATE TABLE ShiftLog.ShiftEmployees (
  shiftId INT NOT NULL,
  instance VARCHAR(20) NOT NULL,
  employeeNumber VARCHAR(10) NOT NULL,
  crewId INT,
  shiftEmployeeNote VARCHAR(200) NOT NULL DEFAULT '',
  PRIMARY KEY (shiftId, employeeNumber),
  FOREIGN KEY (shiftId) REFERENCES ShiftLog.Shifts (shiftId),
  FOREIGN KEY (instance, employeeNumber) REFERENCES ShiftLog.Employees (instance, employeeNumber),
  FOREIGN KEY (crewId) REFERENCES ShiftLog.Crews (crewId)
)
GO
CREATE TABLE ShiftLog.ShiftEquipment (
  shiftId INT NOT NULL,
  instance VARCHAR(20) NOT NULL,
  equipmentNumber VARCHAR(20) NOT NULL,
  employeeNumber VARCHAR(10),
  shiftEquipmentNote VARCHAR(200) NOT NULL DEFAULT '',
  PRIMARY KEY (shiftId, equipmentNumber),
  FOREIGN KEY (shiftId) REFERENCES ShiftLog.Shifts (shiftId),
  FOREIGN KEY (instance, equipmentNumber) REFERENCES ShiftLog.Equipment (instance, equipmentNumber),
  FOREIGN KEY (instance, employeeNumber) REFERENCES ShiftLog.Employees (instance, employeeNumber)
)
GO
CREATE TABLE ShiftLog.ShiftWorkOrders (
  shiftId INT NOT NULL,
  workOrderId INT NOT NULL,
  shiftWorkOrderNote VARCHAR(200) NOT NULL DEFAULT '',
  PRIMARY KEY (shiftId, workOrderId),
  FOREIGN KEY (shiftId) REFERENCES ShiftLog.Shifts (shiftId),
  FOREIGN KEY (workOrderId) REFERENCES ShiftLog.WorkOrders (workOrderId)
)
GO
CREATE TABLE ShiftLog.AdhocTasks (
  adhocTaskId INT NOT NULL PRIMARY KEY identity(1, 1),
  adhocTaskTypeDataListItemId INT NOT NULL,
  taskDescription VARCHAR(200) NOT NULL DEFAULT '',
  locationAddress1 VARCHAR(100) NOT NULL DEFAULT '',
  locationAddress2 VARCHAR(100) NOT NULL DEFAULT '',
  locationCityProvince VARCHAR(50) NOT NULL DEFAULT '',
  locationLatitude DECIMAL(10, 7),
  locationLongitude DECIMAL(10, 7),
  fromLocationAddress1 VARCHAR(100) NOT NULL DEFAULT '',
  fromLocationAddress2 VARCHAR(100) NOT NULL DEFAULT '',
  fromLocationCityProvince VARCHAR(50) NOT NULL DEFAULT '',
  fromLocationLatitude DECIMAL(10, 7),
  fromLocationLongitude DECIMAL(10, 7),
  toLocationAddress1 VARCHAR(100) NOT NULL DEFAULT '',
  toLocationAddress2 VARCHAR(100) NOT NULL DEFAULT '',
  toLocationCityProvince VARCHAR(50) NOT NULL DEFAULT '',
  toLocationLatitude DECIMAL(10, 7),
  toLocationLongitude DECIMAL(10, 7),
  taskDueDateTime datetime,
  taskCompleteDateTime datetime,
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime,
  FOREIGN KEY (adhocTaskTypeDataListItemId) REFERENCES ShiftLog.DataListItems (dataListItemId)
)
GO
CREATE TABLE ShiftLog.ShiftAdhocTasks (
  shiftId INT NOT NULL,
  adhocTaskId INT NOT NULL,
  shiftAdhocTaskNote VARCHAR(200) NOT NULL DEFAULT '',
  PRIMARY KEY (shiftId, adhocTaskId),
  FOREIGN KEY (shiftId) REFERENCES ShiftLog.Shifts (shiftId),
  FOREIGN KEY (adhocTaskId) REFERENCES ShiftLog.AdhocTasks (adhocTaskId)
)
GO
--
-- TIMESHEETS
--
CREATE TABLE ShiftLog.Timesheets (
  timesheetId INT NOT NULL PRIMARY KEY identity(1, 1),
  instance VARCHAR(20) NOT NULL,
  supervisorEmployeeNumber VARCHAR(10) NOT NULL,
  timesheetTypeDataListItemId INT NOT NULL,
  timesheetTitle VARCHAR(100) NOT NULL DEFAULT '',
  timesheetNote VARCHAR(200) NOT NULL DEFAULT '',
  timesheetDate DATE NOT NULL,
  shiftId INT,
  recordSubmitted_dateTime datetime,
  recordSubmitted_userName VARCHAR(30),
  employeesEntered_dateTime datetime,
  employeesEntered_userName VARCHAR(30),
  equipmentEntered_dateTime datetime,
  equipmentEntered_userName VARCHAR(30),
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime,
  FOREIGN KEY (instance, supervisorEmployeeNumber) REFERENCES ShiftLog.Employees (instance, employeeNumber),
  FOREIGN KEY (timesheetTypeDataListItemId) REFERENCES ShiftLog.DataListItems (dataListItemId)
)
GO
CREATE TABLE ShiftLog.TimesheetColumns (
  timesheetColumnId INT NOT NULL PRIMARY KEY identity(1, 1),
  timesheetId INT NOT NULL,
  columnTitle VARCHAR(50) NOT NULL DEFAULT '',
  workOrderNumber VARCHAR(20),
  costCenterA VARCHAR(20),
  costCenterB VARCHAR(20),
  orderNumber SMALLINT NOT NULL DEFAULT 0,
  FOREIGN KEY (timesheetId) REFERENCES ShiftLog.Timesheets (timesheetId)
)
GO
CREATE TABLE ShiftLog.TimesheetRows (
  timesheetRowId INT NOT NULL PRIMARY KEY identity(1, 1),
  instance VARCHAR(20) NOT NULL,
  timesheetId INT NOT NULL,
  rowTitle VARCHAR(50) NOT NULL DEFAULT '',
  employeeNumber VARCHAR(10),
  equipmentNumber VARCHAR(20),
  jobClassificationDataListItemId INT,
  timeCodeDataListItemId INT,
  FOREIGN KEY (timesheetId) REFERENCES ShiftLog.Timesheets (timesheetId),
  FOREIGN KEY (instance, employeeNumber) REFERENCES ShiftLog.Employees (instance, employeeNumber),
  FOREIGN KEY (instance, equipmentNumber) REFERENCES ShiftLog.Equipment (instance, equipmentNumber),
  FOREIGN KEY (jobClassificationDataListItemId) REFERENCES ShiftLog.DataListItems (dataListItemId),
  FOREIGN KEY (timeCodeDataListItemId) REFERENCES ShiftLog.DataListItems (dataListItemId)
)
GO
CREATE TABLE ShiftLog.TimesheetCells (
  timesheetRowId INT NOT NULL,
  timesheetColumnId INT NOT NULL,
  recordHours DECIMAL(10, 2) NOT NULL DEFAULT 0,
  mappedPositionCode VARCHAR(20),
  mappedPayCode VARCHAR(20),
  mappedTimeCode VARCHAR(20),
  mappingConfidence tinyint NOT NULL DEFAULT 0,
  PRIMARY KEY (timesheetRowId, timesheetColumnId),
  FOREIGN KEY (timesheetRowId) REFERENCES ShiftLog.TimesheetRows (timesheetRowId),
  FOREIGN KEY (timesheetColumnId) REFERENCES ShiftLog.TimesheetColumns (timesheetColumnId)
)
GO
--
-- NOTIFICATIONS
--
CREATE TABLE ShiftLog.NotificationConfigurations (
  notificationConfigurationId INT NOT NULL PRIMARY KEY identity(1, 1),
  instance VARCHAR(20) NOT NULL,
  notificationQueue VARCHAR(50) NOT NULL,
  notificationType VARCHAR(50) NOT NULL,
  notificationTypeFormJson NVARCHAR(max) NOT NULL,
  assignedToId INT,
  isActive BIT NOT NULL DEFAULT 1,
  recordCreate_userName VARCHAR(30) NOT NULL,
  recordCreate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordUpdate_userName VARCHAR(30) NOT NULL,
  recordUpdate_dateTime datetime NOT NULL DEFAULT getdate(),
  recordDelete_userName VARCHAR(30),
  recordDelete_dateTime datetime,
  FOREIGN KEY (assignedToId) REFERENCES ShiftLog.AssignedTo (assignedToId)
)
GO
CREATE TABLE ShiftLog.NotificationLogs (
  notificationLogId bigint NOT NULL PRIMARY KEY identity(1, 1),
  notificationConfigurationId INT NOT NULL,
  recordId INT NOT NULL,
  notificationDateTime datetime NOT NULL DEFAULT getdate(),
  isSuccess BIT NOT NULL,
  errorMessage VARCHAR(1000) NOT NULL DEFAULT '',
  FOREIGN KEY (notificationConfigurationId) REFERENCES ShiftLog.NotificationConfigurations (notificationConfigurationId)
)
GO
