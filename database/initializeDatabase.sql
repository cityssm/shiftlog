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

