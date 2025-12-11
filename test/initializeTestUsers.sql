insert into ShiftLog.Users (
  userName, instance, isActive,
  shifts_canView, shifts_canUpdate, shifts_canManage,
  workOrders_canView, workOrders_canUpdate, workOrders_canManage,
  timesheets_canView, timesheets_canUpdate, timesheets_canManage,
  isAdmin,
  recordCreate_userName, recordUpdate_userName
)
values (
  '~testuser', '', 1,
  1, 1, 0,
  1, 1, 0,
  1, 1, 0,
  0,
  'initializeTestUsers.sql', 'initializeTestUsers.sql'
)
GO

insert into ShiftLog.Users (
  userName, instance, isActive,
  shifts_canView, shifts_canUpdate, shifts_canManage,
  workOrders_canView, workOrders_canUpdate, workOrders_canManage,
  timesheets_canView, timesheets_canUpdate, timesheets_canManage,
  isAdmin,
  recordCreate_userName, recordUpdate_userName
)
values (
  '~testinquiry', '', 1,
  1, 0, 0,
  1, 0, 0,
  1, 0, 0,
  0,
  'initializeTestUsers.sql', 'initializeTestUsers.sql'
)
GO

insert into ShiftLog.Employees (
  instance, employeeNumber, firstName, lastName,
  userName, isSupervisor,
  phoneNumber, phoneNumberAlternate, emailAddress,
  recordCreate_userName, recordUpdate_userName
)
values (
  '', '00001', 'Test', 'Inquiry',
  '~testinquiry', 0,
  '555-0101', '555-0102', 'test.inquiry@example.com',
  'initializeTestUsers.sql', 'initializeTestUsers.sql'
)
GO

insert into ShiftLog.Users (
  userName, instance, isActive,
  shifts_canView, shifts_canUpdate, shifts_canManage,
  workOrders_canView, workOrders_canUpdate, workOrders_canManage,
  timesheets_canView, timesheets_canUpdate, timesheets_canManage,
  isAdmin,
  recordCreate_userName, recordUpdate_userName
)
values (
  '~administrator', '', 1,
  1, 0, 1,
  1, 0, 1,
  1, 0, 1,
  1,
  'initializeTestUsers.sql', 'initializeTestUsers.sql'
)
GO