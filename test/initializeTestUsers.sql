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
  '~administrator', '', 1,
  1, 0, 1,
  1, 0, 1,
  1, 0, 1,
  1,
  'initializeTestUsers.sql', 'initializeTestUsers.sql'
)
GO